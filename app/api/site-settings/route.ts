import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

// GET - Lấy cấu hình trang chủ (public API)
export async function GET() {
  try {
    await connectDB();
    const { getSiteSettings } = await import("@/models/SiteSettings");
    const settings = await getSiteSettings();
    
    // Chỉ trả về thông tin public, không trả về updatedBy
    const publicSettings = {
      siteName: settings?.siteName || "Pass Vé Phim",
      siteDescription: settings?.siteDescription || "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
      logo: settings?.logo || "/icon-192.png",
      favicon: settings?.favicon || "/icon-192.png",
      ogImage: settings?.ogImage,
      themeColor: settings?.themeColor || "#0F172A",
      primaryColor: settings?.primaryColor || "#10B981",
      contactEmail: settings?.contactEmail,
      contactPhone: settings?.contactPhone,
      socialLinks: settings?.socialLinks,
      seoKeywords: settings?.seoKeywords,
      maintenanceMode: settings?.maintenanceMode || false,
    };
    
    return NextResponse.json({ settings: publicSettings });
  } catch (error: any) {
    console.error("Error fetching site settings:", error);
    // Trả về settings mặc định nếu có lỗi
    return NextResponse.json({
      settings: {
        siteName: "Pass Vé Phim",
        siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
        logo: "/icon-192.png",
        favicon: "/icon-192.png",
        themeColor: "#0F172A",
        primaryColor: "#10B981",
        maintenanceMode: false,
      },
    });
  }
}


import SiteSettings from "@/models/SiteSettings";

// GET - Lấy cấu hình trang chủ (public API)
export async function GET() {
  try {
    await connectDB();
    const { getSiteSettings } = await import("@/models/SiteSettings");
    const settings = await getSiteSettings();
    
    // Chỉ trả về thông tin public, không trả về updatedBy
    const publicSettings = {
      siteName: settings?.siteName || "Pass Vé Phim",
      siteDescription: settings?.siteDescription || "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
      logo: settings?.logo || "/icon-192.png",
      favicon: settings?.favicon || "/icon-192.png",
      ogImage: settings?.ogImage,
      themeColor: settings?.themeColor || "#0F172A",
      primaryColor: settings?.primaryColor || "#10B981",
      contactEmail: settings?.contactEmail,
      contactPhone: settings?.contactPhone,
      socialLinks: settings?.socialLinks,
      seoKeywords: settings?.seoKeywords,
      maintenanceMode: settings?.maintenanceMode || false,
    };
    
    return NextResponse.json({ settings: publicSettings });
  } catch (error: any) {
    console.error("Error fetching site settings:", error);
    // Trả về settings mặc định nếu có lỗi
    return NextResponse.json({
      settings: {
        siteName: "Pass Vé Phim",
        siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
        logo: "/icon-192.png",
        favicon: "/icon-192.png",
        themeColor: "#0F172A",
        primaryColor: "#10B981",
        maintenanceMode: false,
      },
    });
  }
}

