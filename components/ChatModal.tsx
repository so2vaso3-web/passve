"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Send, Phone, Package, Clock, Star, Image as ImageIcon, FileText, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface ChatModalProps {
  ticketId: string;
  ticket: {
    _id: string;
    movieTitle: string;
    cinema: string;
    city: string;
    showDate: string | Date;
    showTime: string;
    seats: string;
    sellingPrice: number;
    images?: string[];
  };
  seller: {
    _id: string;
    name: string;
    email?: string;
    image?: string;
    phone?: string;
    rating?: number;
    totalReviews?: number;
    isOnline?: boolean;
    lastSeen?: Date;
  };
  onClose: () => void;
}

interface Message {
  _id: string;
  sender: string;
  senderName?: string;
  message: string;
  type: "text" | "image" | "file";
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

export function ChatModal({ ticketId, ticket, seller, onClose }: ChatModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session && seller._id) {
      // Lấy currentUserId từ database
      const fetchCurrentUser = async () => {
        try {
          const userRes = await fetch("/api/user/current");
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.user?._id) {
              setCurrentUserId(userData.user._id);
            }
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      };
      fetchCurrentUser();
      createOrGetRoom();
    }
  }, [session, seller._id]);

  useEffect(() => {
    if (roomId) {
      fetchMessages();
      // Poll for new messages every 3 seconds (optimized for performance)
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);
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
          sellerId: seller._id,
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
        // Lấy currentUserId từ response hoặc từ session
        if (!currentUserId && session?.user?.email) {
          const userRes = await fetch("/api/user/current");
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.user?._id) {
              setCurrentUserId(userData.user._id);
            }
          }
        }
        // Mark as read
        if (data.messages && data.messages.length > 0) {
          markAsRead();
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!roomId) return;
    try {
      await fetch(`/api/chat/messages/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
    } catch (error) {
      console.error("Error marking as read:", error);
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
          receiverId: seller._id,
          type: "text",
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Play sound
        playNotificationSound();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    setSelectedFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sendImageMessage = async () => {
    if (!selectedFile || !roomId || !session || uploading) return;

    setUploading(true);
    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        toast.error(errorData.error || "Lỗi khi upload ảnh");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // Send message with image
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          message: "📷 Đã gửi ảnh",
          receiverId: seller._id,
          type: "image",
          attachments: [imageUrl],
        }),
      });

      if (res.ok) {
        setSelectedFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        playNotificationSound();
        setTimeout(fetchMessages, 500);
        toast.success("Đã gửi ảnh");
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể gửi ảnh");
      }
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error("Có lỗi xảy ra khi gửi ảnh");
    } finally {
      setUploading(false);
    }
  };

  const cancelImagePreview = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore if audio fails
      });
    } catch (error) {
      // Ignore
    }
  };

  const formatTime = (date: string) => {
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

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getOnlineStatus = () => {
    if (seller.isOnline) return "Đang hoạt động";
    if (seller.lastSeen) {
      const lastSeen = new Date(seller.lastSeen);
      const now = new Date();
      const diff = now.getTime() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 5) return "Vừa hoạt động";
      if (minutes < 60) return `Hoạt động ${minutes} phút trước`;
      return `Hoạt động ${formatTime(seller.lastSeen.toString())}`;
    }
    return "Không rõ";
  };

  if (!session) {
    return null;
  }

  return (
    <>
      {/* Image Viewing Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={viewingImage}
              alt="Full size image"
              width={1200}
              height={1200}
              className="rounded-lg object-contain max-w-full max-h-[90vh] w-auto h-auto mx-auto"
              unoptimized
            />
          </div>
        </div>
      )}

    <div className="fixed inset-0 z-[100] bg-[#0B0F19]">
      <div className="bg-[#111827] border border-[#1F2937] w-full h-full flex flex-col pb-20 md:pb-0">
        {/* Header */}
        <div className="border-b border-[#1F2937] p-4 flex items-center justify-between bg-[#0B0F19]">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-border transition-colors mr-2"
            title="Quay lại danh sách chat"
          >
            <ArrowLeft className="w-5 h-5 text-dark-text2" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            {/* Seller Avatar & Info */}
            <Link 
              href={`/profile?userId=${seller._id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {seller.image ? (
                <div className="relative">
                  <Image
                    src={seller.image}
                    alt={seller.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-neon-green object-cover"
                  />
                  {seller.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-card"></div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center text-white font-bold text-lg relative">
                  {seller.name[0]?.toUpperCase()}
                  {seller.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-card"></div>
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark-text">
                    {seller.name}
                  </span>
                  {seller.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm text-dark-text2 font-semibold">
                        {seller.rating.toFixed(1)}
                      </span>
                      {seller.totalReviews && (
                        <span className="text-xs text-dark-text2">
                          ({seller.totalReviews})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-dark-text2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getOnlineStatus()}
                </p>
              </div>
            </Link>
          </div>

          {/* Ticket Info */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-xl p-3">
              {ticket.images && ticket.images[0] && (
                <Image
                  src={ticket.images[0]}
                  alt={ticket.movieTitle}
                  width={60}
                  height={40}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="text-sm">
                <p className="font-semibold text-dark-text line-clamp-1">{ticket.movieTitle}</p>
                <p className="text-xs text-dark-text2">
                  {ticket.cinema} • {formatDate(ticket.showDate)} {ticket.showTime}
                </p>
                <p className="text-xs text-neon-green font-bold">
                  {formatPrice(ticket.sellingPrice)} đ
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {seller.phone && (
              <button
                onClick={() => window.open(`tel:${seller.phone}`, "_blank")}
                className="p-2 bg-dark-bg border border-dark-border rounded-xl hover:bg-dark-border transition-colors"
                title="Gọi điện"
              >
                <Phone className="w-5 h-5 text-neon-green" />
              </button>
            )}
            <button
              onClick={() => {
                // Filter tickets by seller on homepage
                window.location.href = `/?seller=${seller._id}`;
              }}
              className="p-2 bg-dark-bg border border-dark-border rounded-xl hover:bg-dark-border transition-colors"
              title="Xem thêm vé của người này"
            >
              <Package className="w-5 h-5 text-neon-green" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-dark-bg border border-dark-border rounded-xl hover:bg-dark-border transition-colors"
            >
              <X className="w-5 h-5 text-dark-text2" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0B0F19] space-y-4 pb-28 md:pb-4">
          {loading ? (
            <div className="text-center text-dark-text2 py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
              <p className="mt-2">Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-dark-text2 py-8">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                <Send className="w-8 h-8 text-dark-text2" />
              </div>
              <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUserId ? msg.sender === currentUserId : false;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    {!isMe && (
                      <Link 
                        href={`/profile?userId=${msg.sender}`}
                        className="text-xs text-dark-text2 mb-1 px-2 hover:text-[#10B981] transition-colors block"
                      >
                        {msg.senderName || seller.name}
                      </Link>
                    )}
                    <div
                      className={`rounded-2xl p-3 ${
                        isMe
                          ? "bg-neon-green text-white"
                          : "bg-[#1F2937] text-dark-text"
                      }`}
                    >
                      {msg.type === "image" && msg.attachments && msg.attachments[0] && (
                        <div className="mb-2">
                          <div 
                            className="cursor-pointer group relative"
                            onClick={() => setViewingImage(msg.attachments![0])}
                          >
                            <Image
                              src={msg.attachments[0]}
                              alt="Chat image"
                              width={300}
                              height={300}
                              className="rounded-lg object-cover max-w-full h-auto max-h-96 transition-transform group-hover:scale-[1.02]"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full transition-opacity">
                                Click để xem lớn
                              </span>
                            </div>
                          </div>
                          {msg.message && msg.message !== "📷 Đã gửi ảnh" && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2">{msg.message}</p>
                          )}
                        </div>
                      )}
                      {msg.type === "file" && msg.attachments && msg.attachments[0] && (
                        <div className="mb-2 flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                          <FileText className="w-4 h-4" />
                          <a
                            href={msg.attachments[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            Xem file
                          </a>
                        </div>
                      )}
                      {msg.type !== "image" && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <p className={`text-xs ${
                          isMe ? "text-white/70" : "text-dark-text2"
                        }`}>
                          {formatTime(msg.createdAt)}
                        </p>
                        {isMe && (
                          <span className={`text-xs ${
                            msg.isRead ? "text-blue-400" : "text-white/50"
                          }`}>
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="border-t border-[#1F2937] p-3 md:p-4 bg-[#0B0F19] fixed bottom-32 md:bottom-20 left-0 right-0 z-[101]">
            <div className="relative inline-block max-w-xs md:max-w-md">
              <button
                onClick={cancelImagePreview}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <Image
                src={previewImage}
                alt="Preview"
                width={300}
                height={300}
                className="rounded-lg object-cover max-w-full h-auto"
                unoptimized
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={cancelImagePreview}
                  className="flex-1 px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-white rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={sendImageMessage}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
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
        )}

        {/* Input - Fixed at bottom, above bottom nav */}
        <div className="border-t border-[#1F2937] p-3 md:p-4 bg-[#0B0F19] fixed bottom-20 md:bottom-0 left-0 right-0 z-[101]">
          <div className="flex gap-2 md:gap-3 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-[#111827] border border-[#1F2937] rounded-xl hover:bg-[#1F2937] transition-colors flex-shrink-0 disabled:opacity-50"
              title="Gửi ảnh"
              disabled={uploading || !roomId}
            >
              <ImageIcon className="w-5 h-5 text-[#10B981]" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
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
              disabled={sending || uploading || !roomId || !!previewImage}
              className="flex-1 px-4 py-3 bg-[#111827] border border-[#1F2937] rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all disabled:opacity-50 text-base"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || uploading || !roomId || !!previewImage}
              className="px-5 py-3 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0 min-w-[60px]"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}