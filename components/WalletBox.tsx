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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Số dư khả dụng */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-emerald-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Số dư khả dụng</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(balance)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Có thể rút ngay</span>
          </div>
        </div>
      </div>

      {/* Đang giữ escrow */}
      <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-purple-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Đang giữ escrow</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(escrow)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Chờ giao dịch hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Tổng đã kiếm */}
      <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-rose-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Tổng đã kiếm</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(totalEarned)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Tất cả giao dịch</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Số dư khả dụng */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-emerald-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Số dư khả dụng</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(balance)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Có thể rút ngay</span>
          </div>
        </div>
      </div>

      {/* Đang giữ escrow */}
      <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-purple-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Đang giữ escrow</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(escrow)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Chờ giao dịch hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Tổng đã kiếm */}
      <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden group border border-rose-400/20">
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/25 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-heading font-bold text-sm md:text-base">Tổng đã kiếm</h3>
          </div>
          <p className="text-2xl md:text-3xl font-heading font-black mb-1 md:mb-2 tracking-tight">{formatPrice(totalEarned)} đ</p>
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-95">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <span>Tất cả giao dịch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
