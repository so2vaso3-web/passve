"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("vi-VN").format(numPrice);
};

interface SellingPostCardProps {
  ticket: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    location: string;
    category: string;
    image?: string;
    showDate?: string | Date;
    showTime?: string;
    expireAt?: string | Date;
    isExpired?: boolean;
    status?: string;
    createdAt?: string | Date;
    views?: number;
    inquiries?: number;
  };
  onUpdate: () => void;
}

export function SellingPostCard({ ticket, onUpdate }: SellingPostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleEdit = () => {
    router.push(`/tickets/${ticket.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài đăng này? Hành động này không thể hoàn tác.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Đã xóa bài đăng thành công");
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Có lỗi xảy ra khi xóa bài đăng");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Có lỗi xảy ra khi xóa bài đăng");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleToggleStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === "approved" ? "Bài đăng đã được hiển thị" : "Bài đăng đã được ẩn"
        );
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setUpdating(false);
      setShowMenu(false);
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "pending":
        return (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="bg-neon-green/20 text-neon-green px-2 py-1 rounded-full text-xs font-semibold">
            Đang hiển thị
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
            Đã từ chối
          </span>
        );
      case "sold":
        return (
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
            Đã bán
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getTimeRemaining = () => {
    if (!ticket.expireAt) return "";
    const now = new Date();
    const expire = new Date(ticket.expireAt);
    const diff = expire.getTime() - now.getTime();

    if (diff <= 0) return "Đã hết hạn";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Còn ${hours}h ${minutes}m`;
    }
    return `Còn ${minutes}m`;
  };

  return (
    <div className="relative bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-neon transition-all group">
      {/* Menu Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-dark-bg/80 backdrop-blur-sm border border-dark-border rounded-lg hover:bg-dark-border transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-dark-text2" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-10 z-30 bg-dark-card border border-dark-border rounded-xl shadow-lg min-w-[180px] overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <Link
                href={`/tickets/${ticket.id}`}
                className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors block"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </Link>
              {ticket.status === "approved" && (
                <button
                  onClick={() => handleToggleStatus("pending")}
                  disabled={updating}
                  className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <EyeOff className="w-4 h-4" />
                  Ẩn bài đăng
                </button>
              )}
              {ticket.status === "pending" && (
                <button
                  onClick={() => handleToggleStatus("approved")}
                  disabled={updating}
                  className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  Hiển thị lại
                </button>
              )}
              <div className="border-t border-dark-border" />
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Đang xóa..." : "Xóa bài đăng"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image */}
      <Link href={`/tickets/${ticket.id}`}>
        <div className="relative w-full h-40 sm:h-48 bg-dark-border overflow-hidden">
          {ticket.image ? (
            <Image
              src={ticket.image}
              alt={ticket.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-16 h-16 text-dark-text2" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {getStatusBadge()}
            {ticket.isExpired && (
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                Hết hạn
              </span>
            )}
            {!ticket.isExpired && ticket.expireAt && (
              <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">
                {getTimeRemaining()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <Link href={`/tickets/${ticket.id}`}>
          <h3 className="font-bold mb-2 sm:mb-3 line-clamp-2 text-base sm:text-lg leading-snug transition-colors text-dark-text group-hover:text-neon-green">
            {ticket.title}
          </h3>
        </Link>

        {/* Details */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {ticket.showDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-dark-text2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>
                {formatDate(ticket.showDate)}
                {ticket.showTime && ` • ${ticket.showTime}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-dark-text2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">{ticket.location}</span>
          </div>
        </div>

        {/* Stats */}
        {(ticket.views !== undefined || ticket.inquiries !== undefined) && (
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-dark-text2">
            {ticket.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{ticket.views || 0} lượt xem</span>
              </div>
            )}
            {ticket.inquiries !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{ticket.inquiries || 0} tin nhắn</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-glow text-neon-green-light">
              {formatPrice(ticket.price)} đ
            </p>
            {ticket.originalPrice && ticket.originalPrice > ticket.price && (
              <p className="text-sm sm:text-base text-dark-text2 line-through">
                {formatPrice(ticket.originalPrice)} đ
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 bg-dark-bg border-2 border-dark-border hover:border-neon-green text-dark-text hover:text-neon-green py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Chỉnh sửa</span>
            <span className="xs:hidden">Sửa</span>
          </button>
          <Link
            href={`/tickets/${ticket.id}`}
            className="flex-1 bg-neon-green hover:bg-neon-green-light text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Xem</span>
            <span className="xs:hidden">Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("vi-VN").format(numPrice);
};

interface SellingPostCardProps {
  ticket: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    location: string;
    category: string;
    image?: string;
    showDate?: string | Date;
    showTime?: string;
    expireAt?: string | Date;
    isExpired?: boolean;
    status?: string;
    createdAt?: string | Date;
    views?: number;
    inquiries?: number;
  };
  onUpdate: () => void;
}

export function SellingPostCard({ ticket, onUpdate }: SellingPostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleEdit = () => {
    router.push(`/tickets/${ticket.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài đăng này? Hành động này không thể hoàn tác.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Đã xóa bài đăng thành công");
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Có lỗi xảy ra khi xóa bài đăng");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Có lỗi xảy ra khi xóa bài đăng");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleToggleStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === "approved" ? "Bài đăng đã được hiển thị" : "Bài đăng đã được ẩn"
        );
        onUpdate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setUpdating(false);
      setShowMenu(false);
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "pending":
        return (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="bg-neon-green/20 text-neon-green px-2 py-1 rounded-full text-xs font-semibold">
            Đang hiển thị
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
            Đã từ chối
          </span>
        );
      case "sold":
        return (
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
            Đã bán
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getTimeRemaining = () => {
    if (!ticket.expireAt) return "";
    const now = new Date();
    const expire = new Date(ticket.expireAt);
    const diff = expire.getTime() - now.getTime();

    if (diff <= 0) return "Đã hết hạn";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Còn ${hours}h ${minutes}m`;
    }
    return `Còn ${minutes}m`;
  };

  return (
    <div className="relative bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-neon transition-all group">
      {/* Menu Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-dark-bg/80 backdrop-blur-sm border border-dark-border rounded-lg hover:bg-dark-border transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-dark-text2" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-10 z-30 bg-dark-card border border-dark-border rounded-xl shadow-lg min-w-[180px] overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <Link
                href={`/tickets/${ticket.id}`}
                className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors block"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </Link>
              {ticket.status === "approved" && (
                <button
                  onClick={() => handleToggleStatus("pending")}
                  disabled={updating}
                  className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <EyeOff className="w-4 h-4" />
                  Ẩn bài đăng
                </button>
              )}
              {ticket.status === "pending" && (
                <button
                  onClick={() => handleToggleStatus("approved")}
                  disabled={updating}
                  className="w-full px-4 py-2.5 text-left text-sm text-dark-text hover:bg-dark-border flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  Hiển thị lại
                </button>
              )}
              <div className="border-t border-dark-border" />
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Đang xóa..." : "Xóa bài đăng"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image */}
      <Link href={`/tickets/${ticket.id}`}>
        <div className="relative w-full h-40 sm:h-48 bg-dark-border overflow-hidden">
          {ticket.image ? (
            <Image
              src={ticket.image}
              alt={ticket.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-16 h-16 text-dark-text2" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {getStatusBadge()}
            {ticket.isExpired && (
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                Hết hạn
              </span>
            )}
            {!ticket.isExpired && ticket.expireAt && (
              <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">
                {getTimeRemaining()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <Link href={`/tickets/${ticket.id}`}>
          <h3 className="font-bold mb-2 sm:mb-3 line-clamp-2 text-base sm:text-lg leading-snug transition-colors text-dark-text group-hover:text-neon-green">
            {ticket.title}
          </h3>
        </Link>

        {/* Details */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {ticket.showDate && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-dark-text2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>
                {formatDate(ticket.showDate)}
                {ticket.showTime && ` • ${ticket.showTime}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-dark-text2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">{ticket.location}</span>
          </div>
        </div>

        {/* Stats */}
        {(ticket.views !== undefined || ticket.inquiries !== undefined) && (
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-dark-text2">
            {ticket.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{ticket.views || 0} lượt xem</span>
              </div>
            )}
            {ticket.inquiries !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{ticket.inquiries || 0} tin nhắn</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-glow text-neon-green-light">
              {formatPrice(ticket.price)} đ
            </p>
            {ticket.originalPrice && ticket.originalPrice > ticket.price && (
              <p className="text-sm sm:text-base text-dark-text2 line-through">
                {formatPrice(ticket.originalPrice)} đ
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 bg-dark-bg border-2 border-dark-border hover:border-neon-green text-dark-text hover:text-neon-green py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Chỉnh sửa</span>
            <span className="xs:hidden">Sửa</span>
          </button>
          <Link
            href={`/tickets/${ticket.id}`}
            className="flex-1 bg-neon-green hover:bg-neon-green-light text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Xem</span>
            <span className="xs:hidden">Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

