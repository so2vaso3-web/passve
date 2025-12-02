import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

// GET - Lấy cấu hình trang chủ
export async function GET() {
  try {
    await connectDB();
    const { getSiteSettings } = await import("@/models/SiteSettings");
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy cấu hình trang chủ" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật cấu hình trang chủ
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { 
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await connectDB();
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email }).maxTimeMS(10000);
    
    if (!user) {
      console.error("❌ User not found:", session.user.email);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    if (user.role !== "admin") {
      console.error("❌ User is not admin:", session.user.email);
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { 
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let body;
    try {
      const bodyText = await request.text();
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (parseError: any) {
      console.error("❌ Error parsing request body:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    console.log("📝 Updating site settings:", {
      userId: user._id,
      maintenanceMode: body.maintenanceMode,
      cancellationTimeLimitMinutes: body.cancellationTimeLimitMinutes,
    });
    
    // Validate cancellation time
    if (body.cancellationTimeLimitMinutes !== undefined) {
      const minutes = Number(body.cancellationTimeLimitMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
        return NextResponse.json(
          { success: false, error: "Thời gian hủy vé phải từ 1 đến 1440 phút" },
          { 
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      body.cancellationTimeLimitMinutes = minutes;
    }
    
    // Lấy settings hiện tại hoặc tạo mới
    let settings = await SiteSettings.findOne().maxTimeMS(10000);
    if (!settings) {
      console.log("📝 Creating new site settings");
      try {
        settings = await SiteSettings.create({
          updatedBy: user._id,
          siteName: body.siteName || "Pass Vé Phim",
          siteDescription: body.siteDescription || "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
          logo: body.logo || "/icon-192.png",
          favicon: body.favicon || "/icon-192.png",
          themeColor: body.themeColor || "#0F172A",
          primaryColor: body.primaryColor || "#10B981",
          maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : false,
          cancellationTimeLimitMinutes: body.cancellationTimeLimitMinutes || 5,
          socialLinks: body.socialLinks || {},
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          ogImage: body.ogImage,
          seoKeywords: body.seoKeywords,
        });
        console.log("✅ Created new site settings");
      } catch (createError: any) {
        console.error("❌ Error creating site settings:", createError);
        return NextResponse.json(
          { success: false, error: `Lỗi khi tạo cấu hình: ${createError.message}` },
          { 
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      // Cập nhật settings
      console.log("📝 Updating existing site settings");
      try {
        // Update từng field một cách an toàn
        if (body.siteName !== undefined) settings.siteName = body.siteName;
        if (body.siteDescription !== undefined) settings.siteDescription = body.siteDescription;
        if (body.logo !== undefined) settings.logo = body.logo;
        if (body.favicon !== undefined) settings.favicon = body.favicon;
        if (body.themeColor !== undefined) settings.themeColor = body.themeColor;
        if (body.primaryColor !== undefined) settings.primaryColor = body.primaryColor;
        if (body.maintenanceMode !== undefined) settings.maintenanceMode = body.maintenanceMode;
        if (body.cancellationTimeLimitMinutes !== undefined) settings.cancellationTimeLimitMinutes = body.cancellationTimeLimitMinutes;
        if (body.socialLinks !== undefined) settings.socialLinks = body.socialLinks;
        if (body.contactEmail !== undefined) settings.contactEmail = body.contactEmail;
        if (body.contactPhone !== undefined) settings.contactPhone = body.contactPhone;
        if (body.ogImage !== undefined) settings.ogImage = body.ogImage;
        if (body.seoKeywords !== undefined) settings.seoKeywords = body.seoKeywords;
        
        settings.updatedBy = user._id;
        await settings.save();
        console.log("✅ Updated site settings successfully");
      } catch (updateError: any) {
        console.error("❌ Error updating site settings:", updateError);
        return NextResponse.json(
          { success: false, error: `Lỗi khi cập nhật cấu hình: ${updateError.message}` },
          { 
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Revalidate trang chủ và các routes liên quan
    const { revalidatePath, revalidateTag } = await import("next/cache");
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidateTag("site-settings");
    revalidateTag("tickets");

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình trang chủ thành công",
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        logo: settings.logo,
        favicon: settings.favicon,
        themeColor: settings.themeColor,
        primaryColor: settings.primaryColor,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        socialLinks: settings.socialLinks,
        seoKeywords: settings.seoKeywords,
        maintenanceMode: settings.maintenanceMode,
        cancellationTimeLimitMinutes: settings.cancellationTimeLimitMinutes,
      },
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("❌ Error updating site settings:", error);
    
    // Đảm bảo luôn trả về JSON hợp lệ
    const errorMessage = error.message || error.toString() || "Lỗi khi cập nhật cấu hình";
    console.error("Error details:", {
      message: errorMessage,
      name: error.name,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}