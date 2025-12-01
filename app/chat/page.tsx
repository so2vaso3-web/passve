"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { MessageCircle, Search, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";

interface ChatRoom {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    image?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadRooms();
    }
  }, [status, router]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat/rooms", {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast.error("Lỗi khi tải danh sách chat");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? "Vừa xong" : `${minutes} phút trước`;
      }
      return `${hours} giờ trước`;
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} tuần trước`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} năm trước`;
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === "unread" && room.unreadCount === 0) return false;
    if (searchQuery.length < 3) return true;
    return room.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] pb-20">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0F19] border-b border-[#1F2937] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Chat</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập 3 ký tự để bắt đầu tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-[#111827] border border-[#1F2937] rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
          />
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between">
        <button
          onClick={() => setFilter("all")}
          className={`font-semibold ${
            filter === "all" ? "text-white" : "text-white/70"
          }`}
        >
          Tất cả tin nhắn
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`text-sm underline ${
            filter === "unread" ? "text-[#10B981]" : "text-white/70"
          }`}
        >
          Tin chưa đọc
        </button>
      </div>

      {/* Chat List */}
      <div className="px-4 py-4">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">
              {searchQuery.length >= 3
                ? "Không tìm thấy kết quả"
                : filter === "unread"
                ? "Không có tin nhắn chưa đọc"
                : "Chưa có tin nhắn nào"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => router.push(`/chat/${room._id}`)}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-[#111827] transition-colors text-left"
              >
                {/* Avatar with Badge */}
                <div className="relative flex-shrink-0">
                  {room.otherUser.image ? (
                    <Image
                      src={room.otherUser.image}
                      alt={room.otherUser.name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover border-2 border-[#1F2937]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-lg border-2 border-[#1F2937]">
                      {room.otherUser.name[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white truncate text-base">
                      {room.otherUser.name}
                    </p>
                    <span className="text-xs text-white/50 flex-shrink-0 ml-2">
                      {formatTime(room.lastMessageAt)}
                    </span>
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-white/70 line-clamp-1">
                      {room.lastMessage}
                    </p>
                  )}
                  {room.unreadCount > 0 && (
                    <span className="inline-block mt-1 bg-[#10B981] text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {room.unreadCount > 9 ? "9+" : room.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

