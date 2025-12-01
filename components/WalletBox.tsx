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
      <div className="bg-gradient-to-br from-neon-green to-neon-green-light rounded-2xl p-5 text-white shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5" />
          <h3 className="font-heading font-bold text-base">Số dư khả dụng</h3>
        </div>
        <p className="text-2xl font-heading font-black">{formatPrice(balance)} đ</p>
        <p className="text-xs opacity-90 mt-2">Có thể rút ngay</p>
      </div>

      {/* Đang giữ escrow */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="w-5 h-5" />
          <h3 className="font-heading font-bold text-base">Đang giữ escrow</h3>
        </div>
        <p className="text-2xl font-heading font-black">{formatPrice(escrow)} đ</p>
        <p className="text-xs opacity-90 mt-2">Chờ giao dịch hoàn tất</p>
      </div>

      {/* Tổng đã kiếm */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-heading font-bold text-base">Tổng đã kiếm</h3>
        </div>
        <p className="text-2xl font-heading font-black">{formatPrice(totalEarned)} đ</p>
        <p className="text-xs opacity-90 mt-2">Tất cả giao dịch</p>
      </div>
    </div>
  );
}
