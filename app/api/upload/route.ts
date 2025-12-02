import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import crypto from "crypto";

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

    // Process all files
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Try Cloudinary first (REQUIRED on production) - Dùng direct HTTP API call
      if (cloudName && cloudName !== "your-cloudinary-cloud-name" && apiKey && apiSecret) {
        try {
          // Trim credentials
          const trimmedCloudName = cloudName.trim();
          const trimmedApiKey = apiKey.trim();
          const trimmedApiSecret = apiSecret.trim();

          // Tạo signature cho Cloudinary upload
          const timestamp = Math.round(new Date().getTime() / 1000);
          const params: Record<string, string> = {
            timestamp: timestamp.toString(),
            folder: "pass-ve-phim",
            transformation: "w_1200,h_1200,c_limit,q_auto:good,f_auto",
          };

          // Tạo param string và signature
          const paramString = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join("&");

          const signatureString = `${paramString}${trimmedApiSecret}`;
          const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

          // Tạo FormData để upload
          const formData = new FormData();
          formData.append("file", new Blob([buffer], { type: file.type || "image/png" }), file.name);
          formData.append("folder", "pass-ve-phim");
          formData.append("timestamp", timestamp.toString());
          formData.append("api_key", trimmedApiKey);
          formData.append("signature", signature);
          formData.append("transformation", "w_1200,h_1200,c_limit,q_auto:good,f_auto");

          // Upload trực tiếp đến Cloudinary API
          const uploadUrl = `https://api.cloudinary.com/v1_1/${trimmedCloudName}/image/upload`;

          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
          });

          const responseText = await response.text();

          // Check if response is JSON
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Cloudinary returned non-JSON response:", responseText.substring(0, 500));
            throw new Error(`Cloudinary returned HTML instead of JSON. Status: ${response.status}. This usually means invalid credentials.`);
          }

          if (!response.ok) {
            const errorMsg = responseData.error?.message || responseData.error || "Unknown error";
            console.error("Cloudinary upload failed:", {
              status: response.status,
              error: errorMsg,
              response: responseData,
            });
            throw new Error(`Cloudinary upload failed: ${errorMsg}`);
          }

          return {
            url: responseData.secure_url,
            filename: responseData.public_id,
            cloudinary: true,
          };
        } catch (cloudinaryError: any) {
          console.error(`Cloudinary upload error for ${file.name}:`, cloudinaryError);
          
          // On production, fail if Cloudinary fails (no local fallback)
          if (isProduction) {
            const errorMessage = cloudinaryError.message || "Unknown Cloudinary error";
            if (errorMessage.includes("HTML") || errorMessage.includes("<!DOCTYPE") || errorMessage.includes("invalid credentials")) {
              throw new Error(`Cloudinary authentication failed. Please verify your API credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) on Vercel are correct and match your Cloudinary dashboard.`);
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
