"use client";

import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Ticket } from "@/types/ticket";
import { ChatBox } from "./chat-box";
import { BuyTicketModal } from "@/components/BuyTicketModal";
import { BackButton } from "@/components/BackButton";

interface TicketDetailsProps {
  ticket: Ticket;
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  const { data: session } = useSession();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isOwner = ticket.seller?._id && session?.user?.email ? 
    (ticket.seller as any).email === session.user.email : false;
  const canBuy = session && !isOwner && ticket.status === "approved";

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/" label="Quay lại Trang chủ" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-card">
              <div className="relative aspect-video w-full mb-4 rounded-t-2xl overflow-hidden">
                {ticket.images && ticket.images[selectedImageIndex] && (
                  <Image
                    src={ticket.images[selectedImageIndex]}
                    alt={ticket.movieTitle || "Ticket"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              {ticket.images && ticket.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 p-4">
                  {ticket.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-neon-green shadow-neon-sm"
                          : "border-dark-border hover:border-dark-text2"
                      }`}
                    >
                      <Image src={img} alt={`Vé ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-card mt-6 p-6">
              <h3 className="text-xl font-heading font-bold text-dark-text mb-4">
                Thông tin chi tiết
              </h3>
              <div className="space-y-3 text-dark-text2">
                <div>
                  <span className="font-medium">Rạp:</span> {ticket.cinema || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Thành phố:</span> {ticket.city || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Ngày giờ:</span>{" "}
                  {ticket.showDate
                    ? format(new Date(ticket.showDate), "dd/MM/yyyy")
                    : "N/A"}{" "}
                  - {ticket.showTime || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Ghế:</span>{" "}
                  {Array.isArray(ticket.seats)
                    ? ticket.seats.join(", ")
                    : ticket.seats || "N/A"}
                </div>
                {ticket.description && (
                  <div>
                    <span className="font-medium">Mô tả:</span>
                    <p className="mt-1">{ticket.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-card p-6">
              <h1 className="text-2xl font-heading font-black text-dark-text mb-4">
                {ticket.movieTitle || ticket.title || "Vé xem phim"}
              </h1>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-dark-text2 line-through mb-2">
                    Giá gốc: {formatPrice(ticket.originalPrice || 0)}
                  </p>
                  <p className="text-3xl font-black text-neon-green text-glow">
                    {formatPrice(ticket.sellingPrice || 0)}
                  </p>
                </div>

                <div className="pt-4 border-t border-dark-border">
                  <div className="flex items-center gap-3 mb-3">
                    {ticket.seller?.image ? (
                      <Image
                        src={ticket.seller.image}
                        alt={ticket.seller?.name || "Seller"}
                        width={48}
                        height={48}
                        className="rounded-full border border-dark-border object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center text-white font-bold">
                        {ticket.seller?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-dark-text">
                        {ticket.seller?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-dark-text2">
                          {ticket.seller?.rating?.toFixed(1) || "0.0"} (
                          {ticket.seller?.totalReviews || 0} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {canBuy && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowBuyModal(true)}
                    className="w-full bg-neon-green hover:bg-neon-green-light text-white py-3 px-4 rounded-xl font-bold text-sm transition-all hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Mua ngay
                  </button>
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full bg-dark-bg border-2 border-neon-green text-neon-green hover:bg-neon-green/10 py-3 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Chat với người bán
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl">
                  <p className="text-sm text-dark-text2">
                    Đây là vé của bạn
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBuyModal && (
        <BuyTicketModal
          ticket={{
            id: ticket._id,
            title: ticket.title || ticket.movieTitle || "Vé xem phim",
            movieTitle: ticket.movieTitle || ticket.title || "Vé xem phim",
            cinema: ticket.cinema || "",
            city: ticket.city || "",
            seats:
              Array.isArray(ticket.seats)
                ? ticket.seats.join(", ")
                : ticket.seats || "",
            showDate: ticket.showDate || new Date(),
            showTime: ticket.showTime || "",
            sellingPrice: ticket.sellingPrice || 0,
            originalPrice: ticket.originalPrice,
            seller: {
              name: ticket.seller?.name || "Unknown",
              avatar: ticket.seller?.image,
            },
          }}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {showChat && ticket.seller?._id && (
        <ChatBox
          ticketId={ticket._id}
          sellerId={ticket.seller._id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
