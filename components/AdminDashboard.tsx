"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Package, 
  Users, 
  DollarSign, 
  ArrowDown,
  ArrowUp,
  TrendingUp,
  CheckCircle,
  Clock,
  Building2,
  Image,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";

interface AdminDashboardProps {
  stats: {
    totalTickets: number;
    activeTickets: number;
    soldTickets: number;
    pendingWithdrawals: number;
    pendingDeposits: number;
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalWithdrawals: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const [seeding, setSeeding] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleSeed100Tickets = async () => {
    if (seeding) return;
    
    if (!confirm("Bạn có chắc muốn tạo 100 vé mẫu? Mỗi vé sẽ có ảnh và avatar người bán khác nhau.")) {
      return;
    }

    setSeeding(true);
    try {
      const response = await fetch("/api/admin/seed-100-tickets", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi khi seed vé");
      }

      toast.success(`✅ Đã tạo ${data.tickets} vé với ${data.sellers} người bán!`, {
        duration: 5000,
      });
      
      // Reload page sau 2 giây
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Seed error:", error);
      toast.error(error.message || "Lỗi khi seed vé");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-dark-text2">Quản lý toàn bộ hệ thống</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-neon-green" />
              <span className="text-sm text-dark-text2">Tổng vé</span>
            </div>
            <p className="text-3xl font-heading font-black text-dark-text">{stats.totalTickets}</p>
            <p className="text-sm text-dark-text2 mt-2">{stats.activeTickets} đang bán</p>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-neon-green" />
              <span className="text-sm text-dark-text2">Người dùng</span>
            </div>
            <p className="text-3xl font-heading font-black text-dark-text">{stats.totalUsers}</p>
            <p className="text-sm text-dark-text2 mt-2">{stats.activeUsers} đang hoạt động</p>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-neon-green" />
              <span className="text-sm text-dark-text2">Doanh thu</span>
            </div>
            <p className="text-3xl font-heading font-black text-neon-green-light text-glow">
              {formatPrice(stats.totalRevenue)} đ
            </p>
            <p className="text-sm text-dark-text2 mt-2">Tổng nạp tiền</p>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-sm text-dark-text2">Chờ duyệt</span>
            </div>
            <p className="text-3xl font-heading font-black text-yellow-400">
              {stats.pendingWithdrawals}
            </p>
            <p className="text-sm text-dark-text2 mt-2">Yêu cầu rút tiền</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/deposits"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <ArrowUp className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Duyệt nạp tiền</h3>
            </div>
            <p className="text-sm text-dark-text2">
              {stats.pendingDeposits} yêu cầu đang chờ
            </p>
          </Link>

          <Link
            href="/admin/withdrawals"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <ArrowDown className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Duyệt rút tiền</h3>
            </div>
            <p className="text-sm text-dark-text2">
              {stats.pendingWithdrawals} yêu cầu đang chờ
            </p>
          </Link>

          <Link
            href="/admin/tickets"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Quản lý vé</h3>
            </div>
            <p className="text-sm text-dark-text2">
              {stats.activeTickets} vé đang bán
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Quản lý user</h3>
            </div>
            <p className="text-sm text-dark-text2">
              {stats.totalUsers} người dùng
            </p>
          </Link>

          <Link
            href="/admin/banks"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Tài khoản nhận tiền</h3>
            </div>
            <p className="text-sm text-dark-text2">
              Quản lý STK hệ thống & QR
            </p>
          </Link>

          <Link
            href="/admin/bank-logos"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Image className="w-6 h-6 text-blue-400" />
              <h3 className="font-heading font-bold text-dark-text">Logo ngân hàng</h3>
            </div>
            <p className="text-sm text-dark-text2">
              Quản lý logo cho dropdown user
            </p>
          </Link>

          <Link
            href="/admin/site-settings"
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Image className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Quản lý Trang chủ</h3>
            </div>
            <p className="text-sm text-dark-text2">
              Logo, Favicon, SEO & Cấu hình
            </p>
          </Link>

          <button
            onClick={handleSeed100Tickets}
            disabled={seeding}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-6 h-6 text-neon-green" />
              <h3 className="font-heading font-bold text-dark-text">Seed 100 vé</h3>
            </div>
            <p className="text-sm text-dark-text2">
              {seeding ? "Đang tạo vé..." : "Tạo 100 vé mẫu với ảnh & avatar khác nhau"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}