import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support both "file" (single) and "files" (multiple)
    let files: File[] = [];
    const singleFile = formData.get("file") as File;
    const multipleFiles = formData.getAll("files") as File[];
    
    if (singleFile) {
      files = [singleFile];
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles;
    } else {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate all files first
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB` }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `File ${file.name} must be an image` }, { status: 400 });
      }
    }

    // On Vercel/production, file system is read-only - MUST use Cloudinary
    const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check Cloudinary config on production
    if (isProduction && (!cloudName || cloudName === "your-cloudinary-cloud-name" || !apiKey || !apiSecret)) {
      return NextResponse.json(
        { 
          error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables on Vercel." 
        },
        { status: 500 }
      );
    }

    // Initialize Cloudinary config (re-init để đảm bảo env vars được load đúng)
    if (cloudName && cloudName !== "your-cloudinary-cloud-name" && apiKey && apiSecret) {
      // Trim whitespace from credentials (có thể có spaces thừa khi copy-paste)
      const trimmedCloudName = cloudName.trim();
      const trimmedApiKey = apiKey.trim();
      const trimmedApiSecret = apiSecret.trim();
      
      cloudinary.config({
        cloud_name: trimmedCloudName,
        api_key: trimmedApiKey,
        api_secret: trimmedApiSecret,
      });
    }

    // Process all files
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Try Cloudinary first (REQUIRED on production)
      if (cloudName && cloudName !== "your-cloudinary-cloud-name" && apiKey && apiSecret) {
        try {
          // Upload trực tiếp từ buffer stream
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "pass-ve-phim",
                resource_type: "image",
                transformation: [
                  { width: 1200, height: 1200, crop: "limit" },
                  { quality: "auto:good" },
                  { fetch_format: "auto" },
                ],
                eager_async: false,
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload stream error:", error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            uploadStream.end(buffer);
          });

          return {
            url: (result as any).secure_url,
            filename: (result as any).public_id,
            cloudinary: true,
          };
        } catch (cloudinaryError: any) {
          console.error(`Cloudinary upload error for ${file.name}:`, cloudinaryError);
          console.error("Cloudinary config check:", {
            cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : "missing",
            apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : "missing",
            apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...` : "missing",
          });
          
          // On production, fail if Cloudinary fails (no local fallback)
          if (isProduction) {
            const errorMessage = cloudinaryError.message || "Unknown Cloudinary error";
            // Check if it's a credential error
            if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Invalid") || errorMessage.includes("<!DOCTYPE")) {
              throw new Error(`Cloudinary authentication failed. Please verify your API credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) on Vercel are correct and match your Cloudinary dashboard. Error: ${errorMessage}`);
            }
            throw new Error(`Cloudinary upload failed: ${errorMessage}`);
          }
          // On development, fall through to local storage
        }
      }

      // Fallback: Save to local storage (ONLY for development, NOT on Vercel)
      if (!isProduction) {
        try {
          const uploadsDir = join(process.cwd(), "public", "uploads");
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 15);
          const extension = file.name.split(".").pop();
          const filename = `${timestamp}-${randomStr}.${extension}`;
          const filepath = join(uploadsDir, filename);

          // Save file
          await writeFile(filepath, buffer);

          // Return public URL
          const url = `/uploads/${filename}`;

          return {
            url,
            filename,
            cloudinary: false,
          };
        } catch (localError: any) {
          console.error(`Local storage error for ${file.name}:`, localError);
          throw new Error(`Failed to save file locally: ${localError.message}`);
        }
      }

      // If we reach here, it means Cloudinary is not configured and we're on production
      throw new Error("Upload configuration error: Cloudinary is required on production");
    });

    const results = await Promise.all(uploadPromises);
    
    // Return format: single file -> { url, filename }, multiple files -> { urls: [...] }
    if (results.length === 1) {
      return NextResponse.json(results[0]);
    } else {
      return NextResponse.json({ urls: results.map(r => r.url) });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
