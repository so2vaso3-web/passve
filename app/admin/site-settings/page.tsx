"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload, Image as ImageIcon, Settings, ArrowLeft, X } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  ogImage?: string;
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
}

export default function SiteSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Pass Vé Phim",
    siteDescription: "Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn",
    logo: "/icon-192.png",
    favicon: "/icon-192.png",
    themeColor: "#0F172A",
    primaryColor: "#10B981",
    maintenanceMode: false,
  });

  useEffect(() => {
    if (session && (session.user as any)?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchSettings();
  }, [session, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (type: "logo" | "favicon" | "ogImage") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }

      setUploading(type);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setSettings((prev) => ({ ...prev, [type]: data.url }));
          toast.success(`Upload ${type} thành công!`);
        } else {
          toast.error(data.error || "Upload thất bại");
          console.error("Upload error:", data);
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Có lỗi xảy ra khi upload");
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Cập nhật cấu hình thành công!");
        // Refresh trang chủ để thấy thay đổi
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Có lỗi xảy ra khi lưu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="text-dark-text2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-neon-green" />
            <h1 className="text-2xl font-bold text-dark-text">Quản lý Trang chủ</h1>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          {/* Site Name & Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark-text">Thông tin cơ bản</h2>
            <Input
              label="Tên website"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="VD: Pass Vé Phim"
            />
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Mô tả website
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="Mô tả ngắn về website..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-border bg-dark-800 text-dark-100 placeholder-dark-text2 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
              />
            </div>
          </div>

          {/* Logo & Favicon */}
          <div className="space-y-4 border-t border-dark-border pt-6">
            <h2 className="text-xl font-semibold text-dark-text">Logo & Favicon</h2>
            
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Logo Website
              </label>
              <div className="flex items-start gap-4">
                {settings.logo ? (
                  <div className="relative w-32 h-32 border-2 border-dark-border rounded-lg overflow-hidden bg-dark-card">
                    <Image
                      src={settings.logo}
                      alt="Logo"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      onClick={() => setSettings({ ...settings, logo: "" })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Xóa logo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-card">
                    <ImageIcon className="w-8 h-8 text-dark-text2" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    onClick={() => handleImageUpload("logo")}
                    disabled={uploading === "logo"}
                    className="flex items-center gap-2 bg-neon-green hover:bg-neon-green/80 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {uploading === "logo" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    {uploading === "logo" ? "Đang upload..." : settings.logo ? "Thay đổi Logo" : "Tải lên Logo"}
                  </Button>
                  <p className="text-xs text-dark-text2 mt-2">
                    Kích thước khuyến nghị: 200x200px hoặc lớn hơn (tỷ lệ 1:1)
                  </p>
                </div>
              </div>
              {settings.logo && (
                <div className="mt-2 p-2 bg-dark-card rounded border border-dark-border">
                  <p className="text-xs text-dark-text2">URL: <span className="text-neon-green break-all">{settings.logo}</span></p>
                </div>
              )}
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Favicon (Icon tab trình duyệt)
              </label>
              <div className="flex items-start gap-4">
                {settings.favicon ? (
                  <div className="relative w-16 h-16 border-2 border-dark-border rounded-lg overflow-hidden bg-dark-card">
                    <Image
                      src={settings.favicon}
                      alt="Favicon"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      onClick={() => setSettings({ ...settings, favicon: "" })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Xóa favicon"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-card">
                    <ImageIcon className="w-6 h-6 text-dark-text2" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    onClick={() => handleImageUpload("favicon")}
                    disabled={uploading === "favicon"}
                    className="flex items-center gap-2 bg-neon-green hover:bg-neon-green/80 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {uploading === "favicon" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    {uploading === "favicon" ? "Đang upload..." : settings.favicon ? "Thay đổi Favicon" : "Tải lên Favicon"}
                  </Button>
                  <p className="text-xs text-dark-text2 mt-2">
                    Kích thước khuyến nghị: 32x32px hoặc 64x64px (tỷ lệ 1:1, định dạng .ico hoặc .png)
                  </p>
                </div>
              </div>
              {settings.favicon && (
                <div className="mt-2 p-2 bg-dark-card rounded border border-dark-border">
                  <p className="text-xs text-dark-text2">URL: <span className="text-neon-green break-all">{settings.favicon}</span></p>
                </div>
              )}
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Open Graph Image (Ảnh chia sẻ mạng xã hội)
              </label>
              <div className="flex items-start gap-4">
                {settings.ogImage ? (
                  <div className="relative w-32 h-32 border-2 border-dark-border rounded-lg overflow-hidden bg-dark-card">
                    <Image
                      src={settings.ogImage}
                      alt="OG Image"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setSettings({ ...settings, ogImage: "" })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-card">
                    <ImageIcon className="w-8 h-8 text-dark-text2" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    onClick={() => handleImageUpload("ogImage")}
                    disabled={uploading === "ogImage"}
                    className="flex items-center gap-2 bg-neon-green hover:bg-neon-green/80 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {uploading === "ogImage" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    {uploading === "ogImage" ? "Đang upload..." : settings.ogImage ? "Thay đổi Ảnh" : "Tải lên Ảnh OG"}
                  </Button>
                  <p className="text-xs text-dark-text2 mt-2">
                    Kích thước khuyến nghị: 1200x630px (tỷ lệ 1.91:1) - Ảnh hiển thị khi chia sẻ link lên Facebook, Zalo, etc.
                  </p>
                </div>
              </div>
              {settings.ogImage && (
                <div className="mt-2 p-2 bg-dark-card rounded border border-dark-border">
                  <p className="text-xs text-dark-text2">URL: <span className="text-neon-green break-all">{settings.ogImage}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4 border-t border-dark-border pt-6">
            <h2 className="text-xl font-semibold text-dark-text">Màu sắc</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.themeColor}
                    onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                    className="w-16 h-16 rounded-lg border-2 border-dark-border cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={settings.themeColor}
                      onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                      placeholder="#0F172A"
                      className="font-mono bg-dark-800 text-dark-100"
                    />
                    <p className="text-xs text-dark-text2 mt-1">Màu nền chính của website</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-16 h-16 rounded-lg border-2 border-dark-border cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#10B981"
                      className="font-mono bg-dark-800 text-dark-100"
                    />
                    <p className="text-xs text-dark-text2 mt-1">Màu chủ đạo cho nút, link, highlight</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 border-t border-dark-border pt-6">
            <h2 className="text-xl font-semibold text-dark-text">Liên hệ</h2>
            <Input
              label="Email liên hệ"
              type="email"
              value={settings.contactEmail || ""}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="contact@passve.online"
            />
            <Input
              label="Số điện thoại"
              value={settings.contactPhone || ""}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              placeholder="0123456789"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4 border-t border-dark-border pt-6">
            <h2 className="text-xl font-semibold text-dark-text">Mạng xã hội</h2>
            <Input
              label="Facebook"
              value={settings.socialLinks?.facebook || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                })
              }
              placeholder="https://facebook.com/..."
            />
            <Input
              label="Zalo"
              value={settings.socialLinks?.zalo || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, zalo: e.target.value },
                })
              }
              placeholder="https://zalo.me/..."
            />
            <Input
              label="Telegram"
              value={settings.socialLinks?.telegram || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                })
              }
              placeholder="https://t.me/..."
            />
          </div>

          {/* Maintenance Mode */}
          <div className="border-t border-dark-border pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-dark-text">Chế độ bảo trì</h3>
                <p className="text-sm text-dark-text2">Tắt website để bảo trì</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenanceMode: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-dark-border">
            <Button
              onClick={() => router.push("/admin")}
              variant="ghost"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

