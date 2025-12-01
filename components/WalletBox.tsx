"use client";

import { Wallet, Lock, TrendingUp } from "lucide-react";

interface WalletBoxProps {
  balance: number;
  escrow: number;
  totalEarned: number;
}

export function WalletBox({ balance, escrow, totalEarned }: WalletBoxProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Số dư khả dụng */}
      <div className="relative bg-gradient-to-br from-neon-green via-neon-green to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-neon hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base">Số dư khả dụng</h3>
          </div>
          <p className="text-3xl font-heading font-black mb-1">{formatPrice(balance)} đ</p>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Có thể rút ngay
          </p>
        </div>
      </div>

      {/* Đang giữ escrow */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base">Đang giữ escrow</h3>
          </div>
          <p className="text-3xl font-heading font-black mb-1">{formatPrice(escrow)} đ</p>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Chờ giao dịch hoàn tất
          </p>
        </div>
      </div>

      {/* Tổng đã kiếm */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-red-500/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base">Tổng đã kiếm</h3>
          </div>
          <p className="text-3xl font-heading font-black mb-1">{formatPrice(totalEarned)} đ</p>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Tất cả giao dịch
          </p>
        </div>
      </div>
    </div>
  );
}
