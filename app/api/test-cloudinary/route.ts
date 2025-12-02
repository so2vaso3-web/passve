import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export const dynamic = "force-dynamic";

// Test endpoint để kiểm tra Cloudinary config
export async function GET(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if all env vars are present
    const hasAllVars = !!(cloudName && apiKey && apiSecret);
    
    // Check for default/placeholder values
    const hasPlaceholders = 
      cloudName === "your-cloudinary-cloud-name" ||
      !cloudName ||
      !apiKey ||
      !apiSecret;

    // Initialize Cloudinary
    if (hasAllVars && !hasPlaceholders) {
      // Trim whitespace from credentials (có thể có spaces thừa khi copy-paste)
      const trimmedCloudName = cloudName.trim();
      const trimmedApiKey = apiKey.trim();
      const trimmedApiSecret = apiSecret.trim();
      
      cloudinary.config({
        cloud_name: trimmedCloudName,
        api_key: trimmedApiKey,
        api_secret: trimmedApiSecret,
        secure: true, // Force HTTPS
      });

      // Test upload với 1x1 pixel transparent PNG
      const testImage = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      try {
        // Log config trước khi upload
        console.log("Cloudinary config check:", {
          cloudName: trimmedCloudName,
          apiKey: trimmedApiKey,
          apiSecretLength: trimmedApiSecret.length,
          apiSecretFirst4: trimmedApiSecret.substring(0, 4),
          apiSecretLast4: trimmedApiSecret.substring(trimmedApiSecret.length - 4),
        });

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          try {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "test",
                resource_type: "image",
                timeout: 60000, // 60s timeout
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload_stream error:", {
                    message: error.message,
                    http_code: error.http_code,
                    name: error.name,
                    // Log full error object để debug
                    fullError: error,
                  });
                  reject(error);
                } else if (result) {
                  console.log("Cloudinary upload success:", result.public_id);
                  resolve(result);
                } else {
                  reject(new Error("Upload result is null"));
                }
              }
            );
            
            uploadStream.on("error", (streamError) => {
              console.error("Upload stream error event:", streamError);
              reject(streamError);
            });
            
            uploadStream.end(testImage);
          } catch (streamError: any) {
            console.error("Exception creating upload stream:", streamError);
            reject(streamError);
          }
        });

        return NextResponse.json({
          success: true,
          message: "✅ Cloudinary configured correctly! Upload test successful.",
          config: {
            cloudName: trimmedCloudName ? `${trimmedCloudName.substring(0, 3)}...` : "missing",
            apiKey: trimmedApiKey ? `${trimmedApiKey.substring(0, 3)}...` : "missing",
            apiSecretLength: trimmedApiSecret.length,
          },
          testUpload: {
            publicId: (result as any).public_id,
            url: (result as any).secure_url,
          },
        });
      } catch (uploadError: any) {
        // Log chi tiết error để debug
        console.error("Cloudinary upload error details:", {
          message: uploadError.message,
          http_code: uploadError.http_code,
          name: uploadError.name,
          cloudName: trimmedCloudName,
          apiKey: trimmedApiKey,
          apiSecretLength: trimmedApiSecret.length,
          apiSecretFirstChars: trimmedApiSecret.substring(0, 4),
          apiSecretLastChars: trimmedApiSecret.substring(trimmedApiSecret.length - 4),
        });

        return NextResponse.json(
          {
            success: false,
            message: "Cloudinary config found but upload failed",
            error: uploadError.message,
            errorCode: uploadError.http_code || 500,
            errorName: uploadError.name,
            config: {
              cloudName: trimmedCloudName ? `${trimmedCloudName.substring(0, 3)}...` : "missing",
              apiKey: trimmedApiKey ? `${trimmedApiKey.substring(0, 3)}...` : "missing",
              apiSecretLength: trimmedApiSecret.length,
              // Chỉ show first và last 4 chars để verify mà không expose secret
              apiSecretPreview: trimmedApiSecret ? 
                `${trimmedApiSecret.substring(0, 4)}...${trimmedApiSecret.substring(trimmedApiSecret.length - 4)}` : 
                "missing",
            },
            troubleshooting: {
              hint: "Cloudinary trả về HTML thay vì JSON = credentials sai. Kiểm tra:",
              checks: [
                "1. API Secret trên Vercel phải khớp 100% với Cloudinary Dashboard",
                "2. Không có spaces ở đầu/cuối",
                "3. API Secret thường dài 27-32 ký tự",
                "4. Verify trên Cloudinary Dashboard → Settings → Security → API Secret",
              ],
            },
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary environment variables missing or using placeholders",
          config: {
            cloudName: cloudName || "missing",
            apiKey: apiKey ? "present" : "missing",
            apiSecret: apiSecret ? "present" : "missing",
            hasPlaceholders,
          },
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

