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

// Helper function để lấy settings
export async function getSiteSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    // Tạo settings mặc định nếu chưa có
    const User = mongoose.model("User");
    const admin = await User.findOne({ role: "admin" });
    settings = await SiteSettings.create({
      updatedBy: admin?._id || new mongoose.Types.ObjectId(),
    });
  }
  return settings;
}

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;

