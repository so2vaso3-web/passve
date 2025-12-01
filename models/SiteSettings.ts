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
    let settings = await SiteSettings.findOne();
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
    // Trả về object mặc định nếu có lỗi
    return {
      siteName: "Pass Vé Phim",
      siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
      logo: "/icon-192.png",
      favicon: "/icon-192.png",
      themeColor: "#0F172A",
      primaryColor: "#10B981",
      maintenanceMode: false,
    } as any;
  }
}

export default SiteSettings;

