import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      // Test upload với 1x1 pixel transparent PNG
      const testImage = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "test",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(testImage);
        });

        return NextResponse.json({
          success: true,
          message: "Cloudinary configured correctly!",
          config: {
            cloudName: cloudName ? `${cloudName.substring(0, 3)}...` : "missing",
            apiKey: apiKey ? `${apiKey.substring(0, 3)}...` : "missing",
            apiSecretLength: apiSecret ? apiSecret.length : 0,
          },
          testUpload: {
            publicId: (result as any).public_id,
            url: (result as any).secure_url,
          },
        });
      } catch (uploadError: any) {
        return NextResponse.json(
          {
            success: false,
            message: "Cloudinary config found but upload failed",
            error: uploadError.message,
            errorCode: uploadError.http_code,
            config: {
              cloudName: cloudName ? `${cloudName.substring(0, 3)}...` : "missing",
              apiKey: apiKey ? `${apiKey.substring(0, 3)}...` : "missing",
              apiSecretLength: apiSecret ? apiSecret.length : 0,
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

