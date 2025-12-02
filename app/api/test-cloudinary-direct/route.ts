import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Test Cloudinary bằng direct HTTP API call (không dùng SDK)
export async function GET(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Cloudinary environment variables",
          config: {
            cloudName: cloudName ? "present" : "missing",
            apiKey: apiKey ? "present" : "missing",
            apiSecret: apiSecret ? "present" : "missing",
          },
        },
        { status: 400 }
      );
    }

    // Tạo test image (1x1 transparent PNG)
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const testImageBuffer = Buffer.from(testImageBase64, "base64");

    // Tạo signature cho Cloudinary upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: Record<string, string> = {
      timestamp: timestamp.toString(),
      folder: "test",
    };

    // Tạo param string và signature
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const signatureString = `${paramString}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    // Tạo FormData để upload
    const formData = new FormData();
    formData.append("file", new Blob([testImageBuffer], { type: "image/png" }), "test.png");
    formData.append("folder", "test");
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    // Upload trực tiếp đến Cloudinary API
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log("Direct Cloudinary upload test:", {
      url: uploadUrl,
      cloudName,
      apiKey: apiKey.substring(0, 4) + "...",
      apiSecretLength: apiSecret.length,
      timestamp,
      signatureLength: signature.length,
    });

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    
    console.log("Cloudinary response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyPreview: responseText.substring(0, 200),
    });

    // Check if response is JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary returned HTML instead of JSON",
          error: "Invalid JSON response",
          httpStatus: response.status,
          responsePreview: responseText.substring(0, 500),
          troubleshooting: {
            hint: "Cloudinary trả về HTML = credentials sai hoặc account bị limit",
            checks: [
              "1. Kiểm tra Cloudinary Dashboard → Settings → Security → API Key & Secret",
              "2. Đảm bảo account không bị suspended",
              "3. Kiểm tra usage limits trên Cloudinary Dashboard",
              "4. Thử tạo API Key mới trên Cloudinary",
            ],
          },
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary upload failed",
          error: responseData.error?.message || responseData.error || "Unknown error",
          httpStatus: response.status,
          cloudinaryResponse: responseData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✅ Cloudinary direct API call successful!",
      upload: {
        publicId: responseData.public_id,
        url: responseData.secure_url,
        format: responseData.format,
        width: responseData.width,
        height: responseData.height,
      },
      config: {
        cloudName: cloudName.substring(0, 3) + "...",
        apiKey: apiKey.substring(0, 3) + "...",
      },
    });
  } catch (error: any) {
    console.error("Direct Cloudinary test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

