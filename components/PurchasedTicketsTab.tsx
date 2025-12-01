"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Search, Filter, Calendar, MapPin, Clock, Ticket, QrCode, CheckCircle, XCircle, Download, Eye, MessageCircle, AlertCircle } from "lucide-react";
import { TicketCard } from "@/components/TicketCard";
import { QRImageModal } from "@/components/QRImageModal";
import { CancelTicketButton } from "@/components/CancelTicketButton";
import { ChatModal } from "@/components/ChatModal";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface PurchasedTicket {
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
  ticketCode?: string;
  qrImage?: string | string[];
  buyer?: string;
  buyerEmail?: string;
  soldAt?: string | Date;
}

interface PurchasedTicketsTabProps {
  userId: string;
}

export function PurchasedTicketsTab({ userId }: PurchasedTicketsTabProps) {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRIndex, setSelectedQRIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatTicket, setChatTicket] = useState<PurchasedTicket | null>(null);

  useEffect(() => {
    loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?user=${userId}&status=purchased`, {
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Không thể tải danh sách vé đã mua");
        setTickets([]);
      }
    } catch (error: any) {
      console.error("Error loading purchased tickets:", error);
      toast.error("Lỗi khi tải danh sách vé đã mua");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = 
        ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.cinema?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && !ticket.isExpired && ticket.status === "sold") ||
        (statusFilter === "expired" && ticket.isExpired) ||
        (statusFilter === "cancelled" && ticket.status === "cancelled");

      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tickets.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [tickets]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = (ticket: PurchasedTicket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleViewQR = (ticket: PurchasedTicket, index: number = 0) => {
    setSelectedTicket(ticket);
    setSelectedQRIndex(index);
    setShowQRModal(true);
  };

  const handleChat = (ticket: PurchasedTicket) => {
    setChatTicket(ticket);
    setShowChat(true);
  };

  const getStatusBadge = (ticket: PurchasedTicket) => {
    if (ticket.isExpired) {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold border border-red-500/30">
          Đã hết hạn
        </span>
      );
    }
    if (ticket.status === "cancelled") {
      return (
        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">
          Đã hủy
        </span>
      );
    }
    if (ticket.status === "sold") {
      return (
        <span className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-semibold border border-neon-green/30">
          Đã mua thành công
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mb-4"></div>
        <p className="text-white/70">Đang tải vé đã mua...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-24 h-24 text-white/20 mx-auto mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">Chưa có vé đã mua</h3>
        <p className="text-white/60 mb-6">
          Bạn chưa mua vé nào. Hãy khám phá các vé đang được rao bán trên trang chủ!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          Xem vé đang bán
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-neon-green/10 to-emerald-500/10 border border-neon-green/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neon-green/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-white/70">Tổng vé đã mua</p>
              <p className="text-2xl font-black text-white">{tickets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Vé còn hiệu lực</p>
              <p className="text-2xl font-black text-white">
                {tickets.filter((t) => !t.isExpired && t.status === "sold").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Ticket className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">Có mã vé</p>
              <p className="text-2xl font-black text-white">
                {tickets.filter((t) => t.ticketCode).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Tìm kiếm vé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#1F2937] bg-[#0B0F19] text-white placeholder-white/50 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#1F2937] bg-[#0B0F19] text-white focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Còn hiệu lực</option>
              <option value="expired">Đã hết hạn</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-[#1F2937] bg-[#0B0F19] text-white focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 appearance-none"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-white/60">
          Hiển thị {filteredTickets.length} / {tickets.length} vé
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">Không tìm thấy vé nào phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hover:border-neon-green/50 transition-all group"
            >
              {/* Image */}
              {ticket.image && (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={ticket.image}
                    alt={ticket.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(ticket)}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-bold text-white text-lg line-clamp-2">
                  {ticket.title || ticket.movieTitle || "Không có tiêu đề"}
                </h3>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  {ticket.cinema && (
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span>{ticket.cinema}</span>
                    </div>
                  )}
                  {ticket.showDate && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(ticket.showDate)}</span>
                    </div>
                  )}
                  {ticket.showTime && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>{ticket.showTime}</span>
                    </div>
                  )}
                  {ticket.seats && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Ticket className="w-4 h-4" />
                      <span>Ghế: {ticket.seats}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]">
                  <div>
                    <p className="text-xs text-white/60">Giá đã mua</p>
                    <p className="text-xl font-black text-neon-green">
                      {formatPrice(ticket.price)} đ
                    </p>
                  </div>
                  {ticket.soldAt && (
                    <div className="text-right">
                      <p className="text-xs text-white/60">Ngày mua</p>
                      <p className="text-sm font-semibold text-white/80">
                        {formatDate(ticket.soldAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ticket Code & QR */}
                {(ticket.ticketCode || ticket.qrImage) && (
                  <div className="pt-3 border-t border-[#1F2937] space-y-3">
                    {ticket.ticketCode && (
                      <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Ticket className="w-4 h-4 text-neon-green" />
                          <span className="text-xs font-semibold text-neon-green">Mã vé:</span>
                        </div>
                        <p className="text-lg font-black text-neon-green font-mono tracking-wider">
                          {ticket.ticketCode}
                        </p>
                      </div>
                    )}
                    {ticket.qrImage && Array.isArray(ticket.qrImage) && ticket.qrImage.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="w-4 h-4 text-neon-green" />
                          <span className="text-xs font-semibold text-neon-green">
                            Ảnh mã QR ({ticket.qrImage.length} ảnh)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {ticket.qrImage.slice(0, 2).map((img, index) => (
                            <button
                              key={index}
                              onClick={() => handleViewQR(ticket, index)}
                              className="relative aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30 hover:border-neon-green transition-colors"
                            >
                              <Image
                                src={img}
                                alt={`QR ${index + 1}`}
                                fill
                                className="object-contain p-1"
                              />
                            </button>
                          ))}
                        </div>
                        {ticket.qrImage.length > 2 && (
                          <button
                            onClick={() => handleViewQR(ticket, 0)}
                            className="mt-2 text-xs text-neon-green hover:text-neon-green-light"
                          >
                            Xem tất cả {ticket.qrImage.length} ảnh →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-[#1F2937] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleViewDetail(ticket)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] hover:border-neon-green/50 text-white rounded-lg transition-all text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </button>
                    {ticket.seller?._id && (
                      <button
                        onClick={() => handleChat(ticket)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 hover:border-neon-green/50 text-neon-green rounded-lg transition-all text-sm font-semibold"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    )}
                  </div>
                  
                  {/* Cancel button if within time limit */}
                  {ticket.status === "sold" && !ticket.isExpired && (
                    <CancelTicketButton
                      ticketId={ticket.id}
                      soldAt={ticket.soldAt}
                      createdAt={ticket.createdAt}
                      showAdminButton={true}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] my-4 sm:my-8 flex flex-col">
            <div className="sticky top-0 bg-[#111827] border-b border-[#1F2937] p-3 sm:p-4 flex items-center justify-between flex-shrink-0 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-white pr-2">Chi tiết vé đã mua</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/70 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
              {/* Image */}
              {selectedTicket.image && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden">
                  <Image
                    src={selectedTicket.image}
                    alt={selectedTicket.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Tiêu đề</p>
                  <p className="text-white font-semibold">{selectedTicket.title || selectedTicket.movieTitle}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Rạp</p>
                  <p className="text-white font-semibold">{selectedTicket.cinema || "Chưa có"}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Thành phố</p>
                  <p className="text-white font-semibold">{selectedTicket.city || "Chưa có"}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Ngày chiếu</p>
                  <p className="text-white font-semibold">{formatDate(selectedTicket.showDate)}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Giờ chiếu</p>
                  <p className="text-white font-semibold">{selectedTicket.showTime || "Chưa có"}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Ghế</p>
                  <p className="text-white font-semibold">{selectedTicket.seats || "Chưa có"}</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Giá đã mua</p>
                  <p className="text-xl font-black text-neon-green">{formatPrice(selectedTicket.price)} đ</p>
                </div>
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1">Ngày mua</p>
                  <p className="text-white font-semibold">{formatDateTime(selectedTicket.soldAt)}</p>
                </div>
              </div>

              {/* Ticket Code */}
              {selectedTicket.ticketCode && (
                <div className="bg-gradient-to-r from-neon-green/10 to-emerald-500/10 border border-neon-green/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-5 h-5 text-neon-green" />
                    <span className="font-semibold text-white">Mã vé của bạn</span>
                  </div>
                  <p className="text-2xl font-black text-neon-green font-mono tracking-wider">
                    {selectedTicket.ticketCode}
                  </p>
                </div>
              )}

              {/* QR Images */}
              {selectedTicket.qrImage && Array.isArray(selectedTicket.qrImage) && selectedTicket.qrImage.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-neon-green" />
                    <span className="font-semibold text-white">Ảnh mã QR ({selectedTicket.qrImage.length} ảnh)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTicket.qrImage.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => handleViewQR(selectedTicket, index)}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30 hover:border-neon-green transition-colors"
                      >
                        <Image
                          src={img}
                          alt={`QR ${index + 1}`}
                          fill
                          className="object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {selectedTicket.seller && (
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-2">Người bán</p>
                  <div className="flex items-center gap-3">
                    {selectedTicket.seller.avatar ? (
                      <Image
                        src={selectedTicket.seller.avatar}
                        alt={selectedTicket.seller.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center text-white font-bold">
                        {selectedTicket.seller.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{selectedTicket.seller.name}</p>
                      {selectedTicket.seller.rating && (
                        <p className="text-xs text-white/60">
                          ⭐ {selectedTicket.seller.rating.toFixed(1)} ({selectedTicket.seller.totalReviews || 0} đánh giá)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#1F2937]">
                {selectedTicket.seller?._id && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleChat(selectedTicket);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-lg font-semibold transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Liên hệ người bán
                  </button>
                )}
                <Link
                  href={`/post/${selectedTicket.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] hover:border-neon-green/50 text-white rounded-lg font-semibold transition-all"
                >
                  <Eye className="w-5 h-5" />
                  Xem bài đăng
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedTicket && selectedTicket.qrImage && (
        <QRImageModal
          images={Array.isArray(selectedTicket.qrImage) ? selectedTicket.qrImage : [selectedTicket.qrImage]}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTicket(null);
          }}
          initialIndex={selectedQRIndex}
          ticketTitle={selectedTicket.title || selectedTicket.movieTitle}
        />
      )}

      {/* Chat Modal */}
      {showChat && chatTicket && chatTicket.seller?._id && (
        <ChatModal
          ticketId={chatTicket.id}
          ticket={{
            _id: chatTicket.id,
            movieTitle: chatTicket.movieTitle || chatTicket.title || "",
            cinema: chatTicket.cinema || "",
            city: chatTicket.city || "",
            showDate: chatTicket.showDate || new Date(),
            showTime: chatTicket.showTime || "",
            seats: chatTicket.seats || "",
            sellingPrice: chatTicket.price,
            images: chatTicket.image ? [chatTicket.image] : [],
          }}
          seller={{
            _id: chatTicket.seller._id,
            name: chatTicket.seller.name,
            image: chatTicket.seller.avatar,
            email: chatTicket.seller.email,
            phone: chatTicket.seller.phone,
            rating: chatTicket.seller.rating || 0,
            totalReviews: chatTicket.seller.totalReviews || 0,
            isOnline: true,
          }}
          onClose={() => {
            setShowChat(false);
            setChatTicket(null);
          }}
        />
      )}
    </div>
  );
}

