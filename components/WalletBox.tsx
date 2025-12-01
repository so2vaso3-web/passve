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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Số dư khả dụng */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.03] transition-all duration-300 overflow-hidden group border border-emerald-400/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg">Số dư khả dụng</h3>
          </div>
          <p className="text-4xl font-heading font-black mb-2 tracking-tight">{formatPrice(balance)} đ</p>
          <div className="flex items-center gap-2 text-sm font-medium opacity-95">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Có thể rút ngay</span>
          </div>
        </div>
      </div>

      {/* Đang giữ escrow */}
      <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.03] transition-all duration-300 overflow-hidden group border border-purple-400/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg">Đang giữ escrow</h3>
          </div>
          <p className="text-4xl font-heading font-black mb-2 tracking-tight">{formatPrice(escrow)} đ</p>
          <div className="flex items-center gap-2 text-sm font-medium opacity-95">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Chờ giao dịch hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Tổng đã kiếm */}
      <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-rose-500/30 hover:scale-[1.03] transition-all duration-300 overflow-hidden group border border-rose-400/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg">Tổng đã kiếm</h3>
          </div>
          <p className="text-4xl font-heading font-black mb-2 tracking-tight">{formatPrice(totalEarned)} đ</p>
          <div className="flex items-center gap-2 text-sm font-medium opacity-95">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Tất cả giao dịch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
