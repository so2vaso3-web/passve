"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MessageCircle, Clock } from "lucide-react";

interface ChatRoomCardProps {
  room: {
    _id: string;
    ticket: {
      _id: string;
      movieTitle: string;
      images?: string[];
      sellingPrice: number;
      cinema: string;
      city: string;
      showDate: string | Date;
      showTime: string;
      seats: string;
    };
    otherUser: {
      _id: string;
      name: string;
      image?: string;
      isOnline?: boolean;
    };
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
  };
}

export function ChatRoomCard({ room }: ChatRoomCardProps) {
  const router = useRouter();

  const formatTime = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <button
      onClick={() => router.push(`/chat/${room._id}`)}
      className="w-full p-4 bg-dark-bg border border-dark-border rounded-xl hover:border-neon-green hover:shadow-neon transition-all text-left"
    >
        <div className="flex items-start gap-4">
          {/* Ticket Image */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-dark-border">
            {room.ticket.images && room.ticket.images[0] ? (
              <Image
                src={room.ticket.images[0]}
                alt={room.ticket.movieTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dark-border flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-dark-text2" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {room.otherUser.image ? (
                  <Image
                    src={room.otherUser.image}
                    alt={room.otherUser.name}
                    width={24}
                    height={24}
                    className="rounded-full border border-dark-border object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neon-green flex items-center justify-center text-white text-xs font-bold">
                    {room.otherUser.name[0]?.toUpperCase()}
                  </div>
                )}
                <p className="font-bold text-dark-text">{room.otherUser.name}</p>
                {room.otherUser.isOnline && (
                  <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                )}
              </div>
              {room.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                  {room.unreadCount > 9 ? "9+" : room.unreadCount}
                </span>
              )}
            </div>
            <p className="font-semibold text-dark-text mb-1 line-clamp-1">
              {room.ticket.movieTitle}
            </p>
            <p className="text-sm text-dark-text2 mb-1">
              {room.ticket.cinema} • {formatPrice(room.ticket.sellingPrice)} đ
            </p>
            {room.lastMessage && (
              <p className="text-sm text-dark-text2 line-clamp-1 mb-1">
                {room.lastMessage}
              </p>
            )}
            {room.lastMessageAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-dark-text2" />
                <span className="text-xs text-dark-text2">
                  {formatTime(room.lastMessageAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
  );
}

