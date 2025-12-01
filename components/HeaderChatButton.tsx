"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import toast from "react-hot-toast";

export function HeaderChatButton() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (session) {
      fetchUnreadCount();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/chat/unread-count", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;
        const oldCount = prevCountRef.current;
        
        // Play sound and show toast if count increased
        if (newCount > oldCount && oldCount >= 0 && oldCount > 0) {
          playNotificationSound();
          // Get latest message info for toast
          try {
            const roomsRes = await fetch("/api/chat/rooms", { cache: "no-store" });
            if (roomsRes.ok) {
              const roomsData = await roomsRes.json();
              const latestRoom = roomsData.rooms?.[0];
              if (latestRoom && latestRoom.unreadCount > 0) {
                toast.success(
                  `Bạn có tin nhắn mới từ ${latestRoom.otherUser.name} – ${latestRoom.ticket.movieTitle}`,
                  { duration: 5000 }
                );
              }
            }
          } catch (e) {
            // Ignore toast error
          }
        }
        prevCountRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    try {
      // Use Web Audio API to generate a simple "ting" sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback: try to play audio file if available
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore
      }
    }
  };

  if (!session) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowSidebar(true)}
        className="relative p-2 rounded-xl hover:bg-dark-border transition-colors"
        title="Tin nhắn"
      >
        <MessageCircle className="w-6 h-6 text-dark-text2" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showSidebar && (
        <ChatSidebar onClose={() => setShowSidebar(false)} />
      )}
    </>
  );
}