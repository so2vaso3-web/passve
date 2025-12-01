"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Wallet, Star, FileText, DollarSign } from "lucide-react";

interface ProfileSidebarProps {
  stats: {
    activeTickets: number;
    soldTickets: number;
    purchasedTickets: number;
    balance: number;
    escrow: number;
    totalEarned: number;
    rating: number;
  };
}

export function ProfileSidebar({ stats }: ProfileSidebarProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6 sticky top-20">
      {/* Avatar & Name */}
      <div className="text-center mb-6">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={100}
            height={100}
            className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-neon-green object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-neon-green flex items-center justify-center text-white text-2xl font-heading font-bold border-2 border-neon-green">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <h2 className="text-lg font-heading font-bold text-dark-text mb-2">
          {session?.user?.name || "User"}
        </h2>
        <div className="flex items-center justify-center gap-1 text-yellow-400 mb-4">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-semibold text-dark-text">
            {stats.rating.toFixed(1)} ({stats.activeTickets + stats.soldTickets} tin)
          </span>
        </div>
        <Link
          href="/profile?tab=edit"
          className="inline-block px-5 py-2 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold text-sm transition-all hover:shadow-neon"
        >
          Chỉnh sửa
        </Link>
      </div>

      {/* Stats */}
      <div className="space-y-4 border-t border-dark-border pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-text2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Tin đang bán</span>
          </div>
          <span className="font-heading font-bold text-dark-text">{stats.activeTickets}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-text2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Đã bán</span>
          </div>
          <span className="font-heading font-bold text-dark-text">{stats.soldTickets}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark-text2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Số dư</span>
          </div>
          <span className="font-heading font-bold text-neon-green-light text-glow">
            {new Intl.NumberFormat("vi-VN").format(stats.balance)} đ
          </span>
        </div>
      </div>
    </div>
  );
}
