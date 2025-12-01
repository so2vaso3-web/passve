"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { X, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ChatBoxProps {
  ticketId: string;
  sellerId: string;
  onClose: () => void;
}

interface Message {
  _id: string;
  sender: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export function ChatBox({ ticketId, sellerId, onClose }: ChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (session && sellerId) {
      createOrGetRoom();
    }
  }, [session, sellerId]);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createOrGetRoom = async () => {
    try {
      const res = await fetch("/api/chat/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          sellerId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        setRoomId(data.roomId);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const fetchMessages = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session || !roomId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          message: newMessage,
          receiverId: sellerId,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Refresh messages
        setTimeout(fetchMessages, 500);
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-bold text-dark-text mb-2">
              Cần đăng nhập
            </h3>
            <p className="text-dark-text2 mb-6">
              Vui lòng đăng nhập để chat với người bán
            </p>
            <button
              onClick={() => {
                window.location.href = "/api/auth/signin";
              }}
              className="w-full bg-neon-green hover:bg-neon-green-light text-white py-3 rounded-xl font-semibold transition-all mb-3"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={onClose}
              className="w-full text-dark-text2 hover:text-dark-text py-2"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="border-b border-dark-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-heading font-bold text-dark-text">
              Chat với người bán
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-dark-border transition-colors"
          >
            <X className="w-6 h-6 text-dark-text2" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-bg">
          {loading ? (
            <div className="text-center text-dark-text2 py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
              <p className="mt-2">Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-dark-text2 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-dark-text2" />
              <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === session.user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 ${
                      isMe
                        ? "bg-neon-green text-white"
                        : "bg-dark-card border border-dark-border text-dark-text"
                    }`}
                  >
                    {!isMe && msg.senderName && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      isMe ? "text-white/70" : "text-dark-text2"
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-dark-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              disabled={sending || !roomId}
              className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text placeholder-dark-text2 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || !roomId}
              className="px-6 py-3 bg-neon-green hover:bg-neon-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all hover:shadow-neon-sm flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
