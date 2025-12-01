"use client";

import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Hero() {

  return (
    <section className="relative w-full bg-dark-bg py-16 md:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-green-light/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-dark-card border border-dark-border px-5 py-2.5 rounded-full shadow-card mb-8">
            <Ticket className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-bold text-dark-text">
              Chợ Sang Nhượng Vé Số 1 Việt Nam
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark-text mb-6 leading-tight">
            Xem Phim & Concert
            <span className="block bg-gradient-to-r from-neon-green to-neon-green-light bg-clip-text text-transparent mt-2">
              Giá Tốt Nhất Thị Trường
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-dark-text2 mb-10 max-w-2xl mx-auto leading-relaxed">
            Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động.
            <br />
            <span className="font-bold text-neon-green">Hàng ngàn vé đang được rao bán mỗi ngày.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              as={Link}
              href="/sell"
              variant="primary"
              size="lg"
              className="group"
            >
              <span>Đăng bán vé ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              as={Link}
              href="#tickets"
              variant="secondary"
              size="lg"
            >
              Xem vé đang bán
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
