"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChatModal } from "@/components/ChatModal";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && params.roomId) {
      fetchRoom();
    }
  }, [session, params.roomId]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/chat/room/${params.roomId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
      } else {
        router.push("/profile?tab=messages");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      router.push("/profile?tab=messages");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
          <p className="mt-4 text-dark-text2">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-text2 mb-4">Không tìm thấy cuộc trò chuyện</p>
          <button
            onClick={() => router.push("/profile?tab=messages")}
            className="bg-neon-green hover:bg-neon-green-light text-white px-6 py-2 rounded-xl font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <ChatModal
        ticketId={room.ticket._id}
        ticket={room.ticket}
        seller={room.otherUser}
        onClose={() => router.push("/profile?tab=messages")}
      />
    </div>
  );
}

