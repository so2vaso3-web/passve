"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // TODO: Gửi email hoặc lưu vào database
    // Hiện tại chỉ hiển thị thông báo
    setTimeout(() => {
      toast.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-dark-text mb-8 text-center">
          Liên hệ với chúng tôi
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thông tin liên hệ */}
          <Card className="p-6 bg-dark-card border-dark-border">
            <h2 className="text-2xl font-heading font-bold text-dark-text mb-6">
              Thông tin liên hệ
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text mb-1">Email</h3>
                  <a
                    href="mailto:support@passvephim.vn"
                    className="text-neon-green hover:underline text-sm"
                  >
                    support@passvephim.vn
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text mb-1">Hotline</h3>
                  <a
                    href="tel:19001234"
                    className="text-neon-green hover:underline text-sm"
                  >
                    1900 1234
                  </a>
                  <p className="text-xs text-dark-text2 mt-1">
                    Thứ 2 - Chủ nhật: 8:00 - 22:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text mb-1">Địa chỉ</h3>
                  <p className="text-dark-text2 text-sm">
                    Việt Nam
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-dark-border">
              <h3 className="font-semibold text-dark-text mb-3">Kết nối với chúng tôi</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-dark-800 border border-dark-border rounded-lg flex items-center justify-center text-dark-text2 hover:text-neon-green hover:border-neon-green transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-dark-800 border border-dark-border rounded-lg flex items-center justify-center text-dark-text2 hover:text-neon-green hover:border-neon-green transition-colors"
                  aria-label="Zalo"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.315.006-.441.015-.378.033-1.96.169-2.245.18-.285.012-.633.09-.87.27-.237.18-.9 1.152-1.245 1.575-.345.423-.69.495-.966.495s-.621-.09-.87-.27c-.249-.18-1.05-1.035-1.44-1.41-.39-.375-1.035-.405-1.38-.405-.345 0-.69.09-.966.27-.276.18-1.035.945-1.38 1.575-.345.63-.69 1.575-.69 2.25 0 .675.345 1.575.69 2.16.345.585.966 1.575 1.38 2.07.414.495.966.945 1.38 1.26.414.315.966.495 1.38.495.414 0 .966-.09 1.38-.27.414-.18 1.035-.945 1.38-1.575.345-.63.69-1.575.69-2.25 0-.675-.345-1.575-.69-2.16-.345-.585-.966-1.575-1.38-2.07-.414-.495-.966-.945-1.38-1.26-.414-.315-.966-.495-1.38-.495z"/>
                  </svg>
                </a>
              </div>
            </div>
          </Card>

          {/* Form liên hệ */}
          <Card className="p-6 bg-dark-card border-dark-border">
            <h2 className="text-2xl font-heading font-bold text-dark-text mb-6">
              Gửi tin nhắn
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nhập họ và tên"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
              <Input
                label="Số điện thoại"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
              />
              <Input
                label="Chủ đề"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="VD: Hỗ trợ giao dịch"
              />
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Nội dung
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="w-full px-4 py-2.5 rounded-lg border border-dark-border bg-dark-card-bright text-dark-100 placeholder-dark-text2 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all duration-200"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Đang gửi..." : "Gửi tin nhắn"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}