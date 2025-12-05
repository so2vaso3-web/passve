"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Ticket, Sparkles, ShoppingCart, MessageCircle, QrCode, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BuyTicketModal } from "./BuyTicketModal";
import { ChatModal } from "./ChatModal";
import { CancelTicketButton } from "./CancelTicketButton";
import { QRImageModal } from "./QRImageModal";
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
  qrImage?: string | string[];
  buyer?: string;
  buyerEmail?: string;
  soldAt?: string | Date;
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
  soldAt,
}: TicketCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(initialIsExpired || false);
  const [isNew, setIsNew] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHeldByMe, setIsHeldByMe] = useState(false);
  const [selectedQRIndex, setSelectedQRIndex] = useState<number | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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
  // Kiểm tra bằng buyerEmail hoặc buyer ID
  const isMyPurchase = isSold && session?.user?.email && (
    buyerEmail === session.user.email || 
    (buyer && session.user.email === buyerEmail)
  );

  return (
    <>
      <div
        data-ticket-card
        data-ticket-card-id={id}
        className={`group relative bg-dark-card/90 backdrop-blur-sm border border-dark-border/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-card transition-all duration-500 w-full max-w-md ${
          isExpired
            ? "opacity-60 grayscale"
            : "hover:scale-[1.02] hover:shadow-card-hover hover:border-neon-green/50 hover:bg-dark-card-hover cursor-pointer"
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
                unoptimized={image?.includes('picsum.photos') || image?.includes('unsplash.com') || image?.includes('placeholder.com')}
                onError={(e) => {
                  // Fallback nếu ảnh không load được
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center';
                    fallback.innerHTML = '<svg class="w-16 h-16 text-dark-text2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Ticket className="w-16 h-16 text-dark-text2" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            {!isExpired && (
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
              ) : isSold && !isMyPurchase ? (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                  Đã bán
                </span>
              ) : isSold && isMyPurchase ? (
                <span className="bg-neon-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-neon-sm">
                  Đã mua
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

            {discount > 0 && !isExpired && (
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
              isExpired ? "text-dark-text2" : "text-dark-text group-hover:text-neon-green"
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
                  isExpired ? "text-dark-text2" : "text-neon-green-light"
                }`}>
                  {formatPrice(price)} đ
                </p>
                {originalPrice && !isExpired && (
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
                    <span className="text-xs text-dark-text2">
                      ({(Array.isArray(qrImage) ? qrImage : [qrImage]).length} ảnh - Click để xem chi tiết)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Array.isArray(qrImage) ? qrImage : [qrImage]).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedQRIndex(index);
                          setIsQRModalOpen(true);
                          // Đánh dấu card này đang mở modal
                          const card = document.querySelector(`[data-ticket-card-id="${id}"]`);
                          if (card) {
                            (card as HTMLElement).setAttribute("data-qr-modal-open", "true");
                          }
                        }}
                        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30 bg-dark-card hover:border-neon-green transition-[border-color] duration-200 cursor-pointer group"
                        title="Click để xem chi tiết và tải về"
                      >
                        <Image
                          src={img}
                          alt={`Mã QR vé ${index + 1}`}
                          fill
                          className="object-contain p-2"
                          style={{ 
                            willChange: 'auto',
                            transform: 'translateZ(0)', // Force GPU acceleration
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                          <QrCode className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* QR Image Modal */}
              {qrImage && (
                <QRImageModal
                  images={Array.isArray(qrImage) ? qrImage : [qrImage]}
                  isOpen={isQRModalOpen}
                  onClose={() => {
                    setIsQRModalOpen(false);
                    // Xóa đánh dấu khi đóng modal
                    const card = document.querySelector(`[data-ticket-card-id="${id}"]`);
                    if (card) {
                      (card as HTMLElement).removeAttribute("data-qr-modal-open");
                    }
                  }}
                  initialIndex={selectedQRIndex ?? 0}
                  ticketTitle={title}
                />
              )}
            </div>
          )}

          {/* Cancel/Refund button for purchased tickets */}
          {isMyPurchase && status === "sold" && (
            <CancelTicketButton ticketId={id} soldAt={soldAt} createdAt={createdAt} />
          )}

          {/* Action Buttons */}
          {!isExpired && !isSold && (
            <div className="flex gap-2 mt-3 sm:mt-4">
              <Link
                href={`/tickets/${id}`}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary-dark text-white py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 hover:shadow-neon hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                  <span className="hidden xs:inline">Xem chi tiết</span>
                  <span className="xs:hidden">Chi tiết</span>
                </span>
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </Link>
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
