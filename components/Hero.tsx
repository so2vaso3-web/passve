"use client";

import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Hero() {

  return (
    <section className="relative w-full bg-dark-bg py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green-light/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-dark-card border border-dark-border px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-card mb-4 sm:mb-6 md:mb-8">
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-green" />
            <span className="text-xs sm:text-sm font-bold text-dark-text">
              Chợ Sang Nhượng Vé Số 1 Việt Nam
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-dark-text mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
            Xem Phim & Concert
            <span className="block bg-gradient-to-r from-neon-green to-neon-green-light bg-clip-text text-transparent mt-1 sm:mt-2">
              Giá Tốt Nhất Thị Trường
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-dark-text2 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động.
            <br className="hidden sm:block" />
            <span className="font-bold text-neon-green">Hàng ngàn vé đang được rao bán mỗi ngày.</span>
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

import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Hero() {

  return (
    <section className="relative w-full bg-dark-bg py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-neon-green-light/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-dark-card border border-dark-border px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-card mb-4 sm:mb-6 md:mb-8">
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-green" />
            <span className="text-xs sm:text-sm font-bold text-dark-text">
              Chợ Sang Nhượng Vé Số 1 Việt Nam
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-dark-text mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
            Xem Phim & Concert
            <span className="block bg-gradient-to-r from-neon-green to-neon-green-light bg-clip-text text-transparent mt-1 sm:mt-2">
              Giá Tốt Nhất Thị Trường
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-dark-text2 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động.
            <br className="hidden sm:block" />
            <span className="font-bold text-neon-green">Hàng ngàn vé đang được rao bán mỗi ngày.</span>
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
