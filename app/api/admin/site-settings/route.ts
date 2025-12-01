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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const User = (await import("@/models/User")).default;
    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    // Lấy settings hiện tại hoặc tạo mới
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        updatedBy: user._id,
        ...body,
      });
    } else {
      // Cập nhật settings
      Object.assign(settings, body);
      settings.updatedBy = user._id;
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình trang chủ thành công",
      settings,
    });
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi cập nhật cấu hình" },
      { status: 500 }
    );
  }
}

