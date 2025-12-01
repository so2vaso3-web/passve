"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, MessageCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ChatRoom {
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
}

export function ChatSidebar({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchRooms();
      // Poll for updates every 3 seconds (optimized for performance)
      const interval = setInterval(fetchRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchRooms = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/chat/rooms", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRoomClick = (room: ChatRoom) => {
    router.push(`/chat/${room._id}`);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl bg-dark-card border-l border-dark-border">
      <div className="h-full flex flex-col bg-dark-card">
        {/* Header */}
        <div className="border-b border-dark-border p-4 flex items-center justify-between bg-dark-bg">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-heading font-bold text-dark-text">
              Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-border transition-colors"
          >
            <X className="w-5 h-5 text-dark-text2" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-dark-border bg-dark-bg">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập 3 ký tự để bắt đầu tìm kiếm"
              className="w-full pl-10 pr-10 py-2.5 bg-dark-border border border-dark-border rounded-lg text-sm text-dark-text placeholder-dark-text2 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green"
            />
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text2" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text2 hover:text-dark-text">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-dark-border bg-dark-bg flex items-center justify-between">
          <button className="font-bold text-dark-text">Tất cả tin nhắn</button>
          <button className="text-sm text-dark-text2 underline hover:text-neon-green">Tin chưa đọc</button>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto bg-dark-card">
          {loading ? (
            <div className="text-center py-8 text-dark-text2">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-dark-text2 mx-auto mb-4" />
              <p className="text-dark-text2">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  className="w-full p-4 hover:bg-dark-bg transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {room.otherUser.image ? (
                        <Image
                          src={room.otherUser.image}
                          alt={room.otherUser.name}
                          width={56}
                          height={56}
                          className="rounded-full object-cover border-2 border-dark-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-neon-green flex items-center justify-center text-white font-bold text-lg border-2 border-dark-border">
                          {room.otherUser.name[0]?.toUpperCase()}
                        </div>
                      )}
                      {room.otherUser.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-dark-card"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-dark-text truncate text-base">
                          {room.otherUser.name}
                        </p>
                        <span className="text-xs text-dark-text2 flex-shrink-0 ml-2">
                          {formatTime(room.lastMessageAt)}
                        </span>
                      </div>
                      {room.lastMessage && (
                        <p className="text-sm text-dark-text2 line-clamp-1">
                          {room.lastMessage}
                        </p>
                      )}
                      {room.unreadCount > 0 && (
                        <span className="inline-block mt-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {room.unreadCount > 9 ? "9+" : room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Hidden on mobile */}
        <div className="hidden md:block border-t border-dark-border p-4 bg-dark-bg">
          <button
            onClick={() => {
              onClose();
              router.push("/profile?tab=messages");
            }}
            className="w-full bg-dark-card border-2 border-neon-green text-neon-green hover:bg-neon-green/10 py-2.5 px-4 rounded-xl font-semibold transition-all"
          >
            Xem tất cả tin nhắn
          </button>
        </div>
      </div>
    </div>
  );
}