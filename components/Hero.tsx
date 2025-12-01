"use client";

import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Hero() {

  return (
    <section className="relative w-full bg-gradient-to-b from-dark-bg via-dark-bg-secondary to-dark-bg py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden bg-mesh-gradient animate-gradient" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green-light/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-neon-blue/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-bg/50" />

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with glass effect */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 glass border border-dark-border/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full shadow-glass mb-4 sm:mb-6 md:mb-8 animate-slide-up">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green animate-pulse" />
            <span className="text-xs sm:text-sm md:text-base font-bold text-dark-text">
              Chợ Sang Nhượng Vé Số 1 Việt Nam
            </span>
          </div>

          {/* Main heading with enhanced gradient */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-dark-text mb-5 sm:mb-6 md:mb-8 leading-tight px-2 animate-fade-in">
            <span className="block mb-2">Xem Phim & Concert</span>
            <span className="block bg-gradient-to-r from-neon-green via-neon-green-light to-neon-green bg-clip-text text-transparent animate-gradient" style={{ backgroundSize: '200% auto' }}>
              Giá Tốt Nhất Thị Trường
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-dark-text2 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 md:mb-16 px-2">
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