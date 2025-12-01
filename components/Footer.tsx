"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Footer() {
  const pathname = usePathname();
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    // Load logo từ site settings
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.logo) {
          setSiteLogo(data.settings.logo);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);
  
  // Ẩn footer trên mobile ở các trang: chat, profile, my-tickets, sell
  const hideOnMobile = pathname?.includes("/chat") || 
                       pathname?.includes("/profile") || 
                       pathname?.includes("/my-tickets") ||
                       pathname?.includes("/sell");
  
  return (
    <footer className={`bg-dark-card border-t border-dark-border mt-16 sm:mt-20 md:mt-24 py-8 sm:py-10 md:py-12 ${hideOnMobile ? "hidden md:block" : ""}`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {siteLogo && (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                  <Image
                    src={siteLogo}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="text-xl font-heading font-black text-dark-text">Pass Vé Phim</span>
            </div>
            <p className="text-dark-text2 text-sm leading-relaxed mb-4">
              Chợ sang nhượng vé xem phim & sự kiện uy tín, an toàn với hệ thống escrow tự động.
            </p>
            <div className="flex items-center gap-2 text-sm text-dark-text2">
              <Phone className="w-4 h-4" />
              <span>Hotline: 1900 1234</span>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold text-dark-text mb-4 text-base sm:text-lg">Về chúng tôi</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-dark-text mb-4 text-base sm:text-lg">Hỗ trợ</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/help" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Liên hệ hỗ trợ
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-dark-text2 hover:text-neon-green transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 bg-dark-text2 group-hover:bg-neon-green rounded-full transition-colors"></span>
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-dark-text mb-4">Kết nối</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="#"
                className="w-10 h-10 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center text-dark-text2 hover:text-neon-green hover:border-neon-green transition-colors shadow-card"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center text-dark-text2 hover:text-neon-green hover:border-neon-green transition-colors shadow-card"
                aria-label="Zalo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.315.006-.441.015-.378.033-1.96.169-2.245.18-.285.012-.633.09-.87.27-.237.18-.9 1.152-1.245 1.575-.345.423-.69.495-.966.495s-.621-.09-.87-.27c-.249-.18-1.05-1.035-1.44-1.41-.39-.375-1.035-.405-1.38-.405-.345 0-.69.09-.966.27-.276.18-1.035.945-1.38 1.575-.345.63-.69 1.575-.69 2.25 0 .675.345 1.575.69 2.16.345.585.966 1.575 1.38 2.07.414.495.966.945 1.38 1.26.414.315.966.495 1.38.495.414 0 .966-.09 1.38-.27.414-.18 1.035-.945 1.38-1.575.345-.63.69-1.575.69-2.25 0-.675-.345-1.575-.69-2.16-.345-.585-.966-1.575-1.38-2.07-.414-.495-.966-.945-1.38-1.26-.414-.315-.966-.495-1.38-.495z"/>
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-text2">
              <Mail className="w-4 h-4" />
              <span>support@passvephim.vn</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-dark-border text-center text-sm text-dark-text2">
          <p>&copy; 2025 Pass Vé Phim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}