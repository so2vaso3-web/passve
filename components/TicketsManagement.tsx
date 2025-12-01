"use client";

import { useState, useMemo } from "react";
import { Trash2, Eye, EyeOff, Search, Filter, CheckCircle, XCircle, Calendar, DollarSign, User } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "./BackButton";

interface Ticket {
  _id: string;
  title: string;
  category: string;
  status: string;
  isExpired: boolean;
  sellingPrice: number;
  createdAt: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface TicketsManagementProps {
  tickets: Ticket[];
}

export function TicketsManagement({ tickets: initialTickets }: TicketsManagementProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.seller?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.seller?.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "pending" && ticket.status === "pending") ||
        (statusFilter === "approved" && ticket.status === "approved" && !ticket.isExpired) ||
        (statusFilter === "sold" && ticket.status === "sold") ||
        (statusFilter === "expired" && ticket.isExpired) ||
        (statusFilter === "rejected" && ticket.status === "rejected");

      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(tickets.map((t) => t.category));
    return Array.from(cats);
  }, [tickets]);

  const handleDelete = async (ticketId: string) => {
    if (!confirm("Xác nhận xóa vé này? Vé sẽ biến mất khỏi trang chủ ngay lập tức.")) return;

    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success("Đã xóa vé");
      setTickets(tickets.filter((t) => t._id !== ticketId));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleExpired = async (ticketId: string, currentStatus: boolean) => {
    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpired: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success(currentStatus ? "Đã hiển thị vé" : "Đã ẩn vé");
      setTickets(
        tickets.map((t) =>
          t._id === ticketId ? { ...t, isExpired: !currentStatus } : t
        )
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (ticketId: string) => {
    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success("Đã duyệt vé");
      setTickets(
        tickets.map((t) =>
          t._id === ticketId ? { ...t, status: "approved", isExpired: false } : t
        )
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (ticketId: string) => {
    if (!confirm("Xác nhận từ chối vé này?")) return;

    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reject`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success("Đã từ chối vé");
      setTickets(
        tickets.map((t) =>
          t._id === ticketId ? { ...t, status: "rejected" } : t
        )
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTickets.size === 0) {
      toast.error("Vui lòng chọn ít nhất một vé");
      return;
    }

    if (!confirm(`Xác nhận duyệt ${selectedTickets.size} vé đã chọn?`)) return;

    setProcessing("bulk");
    try {
      const promises = Array.from(selectedTickets).map((id) =>
        fetch(`/api/admin/tickets/${id}/approve`, { method: "POST" })
      );
      await Promise.all(promises);

      toast.success(`Đã duyệt ${selectedTickets.size} vé`);
      setTickets(
        tickets.map((t) =>
          selectedTickets.has(t._id)
            ? { ...t, status: "approved", isExpired: false }
            : t
        )
      );
      setSelectedTickets(new Set());
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.size === 0) {
      toast.error("Vui lòng chọn ít nhất một vé");
      return;
    }

    if (!confirm(`Xác nhận xóa ${selectedTickets.size} vé đã chọn?`)) return;

    setProcessing("bulk");
    try {
      const promises = Array.from(selectedTickets).map((id) =>
        fetch(`/api/admin/tickets/${id}`, { method: "DELETE" })
      );
      await Promise.all(promises);

      toast.success(`Đã xóa ${selectedTickets.size} vé`);
      setTickets(tickets.filter((t) => !selectedTickets.has(t._id)));
      setSelectedTickets(new Set());
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const toggleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map((t) => t._id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Quản lý vé
          </h1>
          <p className="text-dark-text2">
            {filteredTickets.length} / {tickets.length} vé
            {selectedTickets.size > 0 && ` • ${selectedTickets.size} đã chọn`}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 md:p-6 mb-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, người bán, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-border bg-dark-800 text-dark-100 placeholder-dark-text2 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-border bg-dark-800 text-dark-100 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 appearance-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="sold">Đã bán</option>
                <option value="expired">Hết hạn</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-dark-border bg-dark-800 text-dark-100 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 appearance-none"
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

          {/* Bulk Actions */}
          {selectedTickets.size > 0 && (
            <div className="flex gap-2 pt-4 border-t border-dark-border">
              <button
                onClick={handleBulkApprove}
                disabled={processing === "bulk"}
                className="px-4 py-2 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Duyệt ({selectedTickets.size})
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={processing === "bulk"}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa ({selectedTickets.size})
              </button>
              <button
                onClick={() => setSelectedTickets(new Set())}
                className="px-4 py-2 bg-dark-bg border border-dark-border hover:border-neon-green text-dark-text hover:text-neon-green rounded-xl font-semibold text-sm transition-all"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>

        {/* Tickets Table */}
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-dark-border bg-dark-800 text-neon-green focus:ring-neon-green"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Người bán
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-dark-text2">
                      Không tìm thấy vé nào
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="border-t border-dark-border hover:bg-dark-bg transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTickets.has(ticket._id)}
                          onChange={() => toggleSelectTicket(ticket._id)}
                          className="w-4 h-4 rounded border-dark-border bg-dark-800 text-neon-green focus:ring-neon-green"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/post/${ticket._id}`}
                          className="font-semibold text-dark-text hover:text-neon-green transition-colors line-clamp-2"
                          target="_blank"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-dark-text2" />
                          <div>
                            <p className="text-sm text-dark-text font-semibold">
                              {ticket.seller?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-dark-text2">
                              {ticket.seller?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text2">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-neon-green" />
                          <span className="font-heading font-bold text-neon-green-light">
                            {formatPrice(ticket.sellingPrice)} đ
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            ticket.status === "sold"
                              ? "bg-blue-500 text-white"
                              : ticket.status === "pending"
                              ? "bg-yellow-500 text-white"
                              : ticket.status === "rejected"
                              ? "bg-red-500 text-white"
                              : ticket.isExpired
                              ? "bg-dark-text2 text-white"
                              : "bg-neon-green text-white"
                          }`}
                        >
                          {ticket.status === "sold"
                            ? "Đã bán"
                            : ticket.status === "pending"
                            ? "Chờ duyệt"
                            : ticket.status === "rejected"
                            ? "Từ chối"
                            : ticket.isExpired
                            ? "Hết hạn"
                            : "Đang bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-dark-text2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(ticket.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {ticket.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(ticket._id)}
                                disabled={processing === ticket._id}
                                className="px-3 py-1.5 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1 hover:shadow-neon-sm"
                                title="Duyệt"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(ticket._id)}
                                disabled={processing === ticket._id}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                                title="Từ chối"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Từ chối
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleExpired(ticket._id, ticket.isExpired)}
                            disabled={processing === ticket._id}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                            title={ticket.isExpired ? "Hiển thị" : "Ẩn"}
                          >
                            {ticket.isExpired ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                            {ticket.isExpired ? "Hiển thị" : "Ẩn"}
                          </button>
                          <button
                            onClick={() => handleDelete(ticket._id)}
                            disabled={processing === ticket._id}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
