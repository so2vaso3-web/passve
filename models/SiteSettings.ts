import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  logo?: string; // URL logo website
  favicon?: string; // URL favicon
  ogImage?: string; // Open Graph image
  themeColor: string;
  primaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    zalo?: string;
    telegram?: string;
  };
  seoKeywords?: string[];
  maintenanceMode: boolean;
  cancellationTimeLimitMinutes?: number; // Thời gian cho phép hủy vé (phút)
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      required: true,
      default: "Pass Vé Phim",
    },
    siteDescription: {
      type: String,
      required: true,
      default: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
    },
    logo: {
      type: String,
      default: "/icon-192.png",
    },
    favicon: {
      type: String,
      default: "/icon-192.png",
    },
    ogImage: {
      type: String,
    },
    themeColor: {
      type: String,
      default: "#0F172A",
    },
    primaryColor: {
      type: String,
      default: "#10B981",
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    socialLinks: {
      facebook: String,
      zalo: String,
      telegram: String,
    },
    seoKeywords: [String],
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    cancellationTimeLimitMinutes: {
      type: Number,
      default: 5, // Mặc định 5 phút
      min: 1,
      max: 1440, // Tối đa 24 giờ
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

// Helper function để lấy settings (phải đặt sau khi định nghĩa SiteSettings)
export async function getSiteSettings() {
  try {
    // Đảm bảo MongoDB đã connect trước khi query
    const connectDB = (await import("@/lib/mongodb")).default;
    const db = await connectDB();
    if (!db) {
      console.warn("MongoDB not connected, returning default settings");
      return {
        siteName: "Pass Vé Phim",
        siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
        logo: "/icon-192.png",
        favicon: "/icon-192.png",
        themeColor: "#0F172A",
        primaryColor: "#10B981",
        maintenanceMode: false,
        cancellationTimeLimitMinutes: 5,
      } as any;
    }

    let settings = await SiteSettings.findOne().maxTimeMS(5000);
    if (!settings) {
      // Tạo settings mặc định nếu chưa có
      const User = mongoose.model("User");
      let admin;
      try {
        admin = await User.findOne({ role: "admin" });
      } catch (error) {
        // Nếu không tìm thấy User model, tạo với ObjectId mặc định
        console.warn("Could not find admin user, using default ObjectId");
      }
      settings = await SiteSettings.create({
        updatedBy: admin?._id || new mongoose.Types.ObjectId(),
      });
    }
    return settings;
  } catch (error: any) {
    console.error("Error in getSiteSettings:", error);
    // Nếu là timeout hoặc connection error, không log chi tiết
    if (error.name === 'MongooseError' || error.message?.includes('timeout')) {
      console.warn("MongoDB query timeout or connection issue, using default settings");
    }
    // Trả về object mặc định nếu có lỗi
    return {
      siteName: "Pass Vé Phim",
      siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
      logo: "/icon-192.png",
      favicon: "/icon-192.png",
      themeColor: "#0F172A",
      primaryColor: "#10B981",
      maintenanceMode: false,
      cancellationTimeLimitMinutes: 5,
    } as any;
  }
}

export default SiteSettings;
