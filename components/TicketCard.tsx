"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Ticket, Sparkles, ShoppingCart, MessageCircle, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BuyTicketModal } from "./BuyTicketModal";
import { ChatModal } from "./ChatModal";
import toast from "react-hot-toast";

interface TicketCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  location: string;
  category: string;
  image?: string;
  seller?: {
    name: string;
    avatar?: string;
    _id?: string;
    email?: string;
    phone?: string;
    rating?: number;
    totalReviews?: number;
  };
  showDate?: string | Date;
  showTime?: string;
  expireAt?: string | Date;
  isExpired?: boolean;
  createdAt?: string | Date;
  movieTitle?: string;
  cinema?: string;
  city?: string;
  seats?: string;
  status?: string;
  onHoldBy?: string;
  ticketCode?: string;
  qrImage?: string;
  buyer?: string;
  buyerEmail?: string;
}

export function TicketCard({
  id,
  title,
  price,
  originalPrice,
  location,
  category,
  image,
  seller,
  showDate,
  showTime,
  expireAt,
  isExpired: initialIsExpired,
  createdAt,
  movieTitle,
  cinema,
  city,
  seats,
  status,
  onHoldBy,
  ticketCode,
  qrImage,
  buyer,
  buyerEmail,
}: TicketCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(initialIsExpired || false);
  const [isNew, setIsNew] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHeldByMe, setIsHeldByMe] = useState(false);

  useEffect(() => {
    if (createdAt) {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
      setIsNew(diffMinutes < 10);
    }
  }, [createdAt]);

  useEffect(() => {
    if (status === "on_hold" && onHoldBy && session?.user?.email) {
      // We'll need to check this properly - for now just check if session exists
      // In production, we'd need to get user ID from session
      setIsHeldByMe(false); // Will be set properly after API call
    }
  }, [status, onHoldBy, session]);

  useEffect(() => {
    if (!expireAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const expire = new Date(expireAt);
      const diff = expire.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m`);
      } else {
        setTimeLeft("Sắp hết hạn");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [expireAt]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      movie: "Vé phim",
      concert: "Vé concert",
      sports: "Vé thể thao",
      event: "Vé sự kiện",
      other: "Khác",
    };
    return labels[cat] || cat;
  };

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  const formatShowDate = () => {
    if (!showDate) return null;
    const date = new Date(showDate);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    setShowBuyModal(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    if (!seller?._id) {
      return;
    }
    setShowChat(true);
  };

  const canBuy = session && status === "approved" && !isExpired;
  const isSold = status === "sold";
  
  // Check if this is my purchase (sold to me)
  const isMyPurchase = isSold && (buyerEmail === session?.user?.email || (buyer && session?.user?.email));

  return (
    <>
      <div
        className={`group relative bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl overflow-hidden shadow-card transition-all duration-300 w-full max-w-md ${
          isExpired || isSold
            ? "opacity-60 grayscale"
            : "hover:scale-[1.03] hover:shadow-neon hover:border-neon-green"
        }`}
      >
        {/* Image */}
        <Link href={`/tickets/${id}`} className="block">
          <div className="relative w-full h-40 sm:h-48 bg-dark-border overflow-hidden rounded-t-xl sm:rounded-t-2xl">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Ticket className="w-16 h-16 text-dark-text2" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            {!isExpired && !isSold && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-lg font-bold">{title}</p>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isNew && !isExpired && !isSold && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm animate-pulse-slow">
                  Mới đăng
                </span>
              )}
              <span className="bg-neon-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                {getCategoryLabel(category)}
              </span>
              {isExpired ? (
                <span className="bg-dark-text2 text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                  Đã hết hạn
                </span>
              ) : isSold ? (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                  Đã bán
                </span>
              ) : timeLeft ? (
                <span className={`text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm ${
                  timeLeft.includes("h") && parseInt(timeLeft) < 3
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}>
                  Còn {timeLeft}
                </span>
              ) : null}
            </div>

            {discount > 0 && !isExpired && !isSold && (
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                  -{discount}%
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <Link href={`/tickets/${id}`}>
            <h3 className={`font-bold mb-2 sm:mb-3 line-clamp-2 text-base sm:text-lg leading-snug transition-colors ${
              isExpired || isSold ? "text-dark-text2" : "text-dark-text group-hover:text-neon-green"
            }`}>
              {title}
            </h3>
          </Link>

          {/* Show date and time */}
          {(showDate || showTime) && (
            <div className="flex items-center gap-2 text-sm text-dark-text2 mb-2">
              <Clock className="w-4 h-4 flex-shrink-0 text-dark-text2" />
              <span>
                {formatShowDate()}
                {showTime && ` • ${showTime}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-dark-text2 mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0 text-dark-text2" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-end justify-between gap-2 mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className={`text-xl sm:text-2xl font-black text-glow ${
                  isExpired || isSold ? "text-dark-text2" : "text-neon-green-light"
                }`}>
                  {formatPrice(price)} đ
                </p>
                {originalPrice && !isExpired && !isSold && (
                  <p className="text-sm text-dark-text2 line-through">
                    {formatPrice(originalPrice)} đ
                  </p>
                )}
              </div>
            </div>
            {seller && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-6 h-6 rounded-full border border-dark-border object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neon-green flex items-center justify-center text-white text-xs font-bold">
                    {seller.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Show ticket code and QR image if purchased */}
          {isMyPurchase && (ticketCode || qrImage) && (
            <div className="mb-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl space-y-3">
              {ticketCode && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Ticket className="w-4 h-4 text-neon-green" />
                    <span className="text-xs font-semibold text-neon-green">Mã vé của bạn:</span>
                  </div>
                  <p className="text-lg font-black text-neon-green font-mono tracking-wider">
                    {ticketCode}
                  </p>
                </div>
              )}
              {qrImage && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-neon-green" />
                    <span className="text-xs font-semibold text-neon-green">Ảnh mã QR:</span>
                  </div>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30 bg-dark-card">
                    <Image
                      src={qrImage}
                      alt="Mã QR vé"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancel/Refund button for purchased tickets */}
          {isMyPurchase && status === "sold" && (
            <div className="mb-4">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!confirm("Bạn có chắc muốn hủy vé này? Tiền sẽ được hoàn về tài khoản của bạn.")) {
                    return;
                  }
                  try {
                    const res = await fetch(`/api/tickets/${id}/cancel`, {
                      method: "POST",
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success("Đã hủy vé và hoàn tiền thành công!");
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    } else {
                      toast.error(data.error || "Có lỗi xảy ra");
                    }
                  } catch (error: any) {
                    toast.error("Có lỗi xảy ra khi hủy vé");
                  }
                }}
                className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Hủy vé / Trả vé
              </button>
            </div>
          )}

          {/* Action Buttons */}
          {!isExpired && !isSold && (
            <div className="flex gap-2 mt-3 sm:mt-4">
              {canBuy ? (
                <>
                  <button
                    onClick={handleBuyClick}
                    className="flex-1 bg-neon-green hover:bg-neon-green-light text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Mua ngay</span>
                    <span className="xs:hidden">Mua</span>
                  </button>
                  {seller?._id && (
                    <button
                      onClick={handleChatClick}
                      className="flex-1 bg-dark-bg border-2 border-neon-green text-neon-green hover:bg-neon-green/10 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Chat</span>
                    </button>
                  )}
                </>
              ) : (
                <Link
                  href={`/tickets/${id}`}
                  className="flex-1 bg-dark-bg border-2 border-dark-border hover:border-neon-green text-dark-text hover:text-neon-green py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] text-center"
                >
                  Xem chi tiết
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <BuyTicketModal
          ticket={{
            id,
            title,
            movieTitle: movieTitle || title,
            cinema: cinema || location.split(",")[0] || "",
            city: city || location.split(",")[1]?.trim() || "",
            seats: seats || "",
            showDate: showDate || new Date(),
            showTime: showTime || "",
            sellingPrice: price,
            originalPrice,
            seller: seller || { name: "Unknown" },
          }}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {/* Chat Modal */}
      {showChat && seller?._id && (
        <ChatModal
          ticketId={id}
          ticket={{
            _id: id,
            movieTitle: movieTitle || title,
            cinema: cinema || location.split(",")[0] || "",
            city: city || location.split(",")[1]?.trim() || "",
            showDate: showDate || new Date(),
            showTime: showTime || "",
            seats: seats || "",
            sellingPrice: price,
            images: image ? [image] : [],
          }}
          seller={{
            _id: seller._id,
            name: seller.name,
            image: seller.avatar,
            email: seller.email,
            phone: seller.phone,
            rating: seller.rating || 0,
            totalReviews: seller.totalReviews || 0,
            isOnline: true, // TODO: Implement real-time online status
          }}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
