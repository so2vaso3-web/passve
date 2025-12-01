"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Gift, Shield, Zap, CheckCircle } from "lucide-react";
import Image from "next/image";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-2 border-neon-green/50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-neon-green/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-red-500/20 border border-red-500/30 rounded-full text-white/70 hover:text-red-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neon-green to-emerald-500 rounded-full mb-6 shadow-neon animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-3">
              Chào mừng đến với{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">
                Pass Vé Phim
              </span>
            </h2>
            <p className="text-lg text-white/80">
              Chợ sang nhượng vé xem phim & sự kiện số 1 Việt Nam
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm hover:border-neon-green/50 transition-all">
              <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm">An toàn tuyệt đối</h3>
              <p className="text-xs text-white/60">Hệ thống escrow tự động</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm hover:border-neon-green/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm">Giao dịch nhanh</h3>
              <p className="text-xs text-white/60">Thanh toán tức thì</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm hover:border-neon-green/50 transition-all">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm">Ưu đãi hấp dẫn</h3>
              <p className="text-xs text-white/60">Giá tốt nhất thị trường</p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              Tại sao chọn chúng tôi?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <span className="text-neon-green mt-1">✓</span>
                <span>Mua bán vé phim, concert, sự kiện uy tín và an toàn</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <span className="text-neon-green mt-1">✓</span>
                <span>Hệ thống escrow tự động bảo vệ người mua và người bán</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <span className="text-neon-green mt-1">✓</span>
                <span>Thanh toán nhanh chóng, tiền được cộng vào ví ngay lập tức</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <span className="text-neon-green mt-1">✓</span>
                <span>Hỗ trợ đầy đủ các ngân hàng trong nước</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green-light hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-neon-sm hover:shadow-neon flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Bắt đầu khám phá
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-white rounded-xl font-semibold transition-all"
            >
              Tìm hiểu thêm
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-white/50 mt-6">
            Bạn có thể đóng thông báo này và xem lại bất cứ lúc nào
          </p>
        </div>
      </div>
    </div>
  );
}

