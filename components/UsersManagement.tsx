"use client";

import { useState, useMemo, useEffect } from "react";
import { Lock, Unlock, User as UserIcon, Search, Filter, Mail, Calendar, DollarSign, Eye, Edit, Plus, Minus, Wallet, Ticket, TrendingUp, RefreshCw, Trash2, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BackButton } from "./BackButton";

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role?: string;
}

interface UsersManagementProps {
  users: User[];
}

interface UserTicket {
  _id: string;
  title?: string;
  movieTitle: string;
  cinema: string;
  city: string;
  showDate: string | Date;
  showTime: string;
  seats: string;
  sellingPrice: number;
  originalPrice?: number;
  status: string;
  isExpired: boolean;
  category: string;
  images?: string[];
  createdAt: string | Date;
  seller?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  buyer?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  soldAt?: string | Date;
}

interface UserDetails {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  wallet: {
    balance: number;
    escrow: number;
    totalEarned: number;
  };
  stats: {
    selling: number;
    sold: number;
    purchased: number;
  };
  transactions: any[];
  tickets?: UserTicket[];
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add");
  const [adjustDescription, setAdjustDescription] = useState("");
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<string | null>(null);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success(currentStatus ? "Đã khóa user" : "Đã mở khóa user");
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = async (userId: string) => {
    setSelectedUser(userId);
    setShowDetails(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/details`);
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      } else {
        toast.error("Không thể tải thông tin chi tiết");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount || parseFloat(adjustAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!adjustDescription.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    setAdjustingBalance(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser}/adjust-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(adjustAmount),
          type: adjustType,
          description: adjustDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setAdjustAmount("");
        setAdjustDescription("");
        // Refresh user details
        if (selectedUser) {
          const detailsRes = await fetch(`/api/admin/users/${selectedUser}/details`);
          if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            setUserDetails(detailsData);
          }
        }
        router.refresh();
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setAdjustingBalance(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatTransactionType = (type: string) => {
    const types: Record<string, string> = {
      deposit: "Nạp tiền",
      withdraw: "Rút tiền",
      sale: "Bán vé",
      purchase: "Mua vé",
      escrow_hold: "Giữ escrow",
      escrow_release: "Giải phóng escrow",
      refund: "Hoàn tiền",
    };
    return types[type] || type;
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

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-dark-text2">
            {filteredUsers.length} / {users.length} người dùng
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 md:p-6 mb-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-text2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Vai trò
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-text2">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-dark-border hover:bg-dark-bg transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center text-white font-heading font-bold text-lg">
                            {user.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-dark-text">{user.name}</p>
                            <p className="text-xs text-dark-text2">ID: {user._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-dark-text2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? "bg-neon-green text-white"
                              : "bg-dark-text2 text-white"
                          }`}
                        >
                          {user.isActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-dark-text2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewDetails(user._id)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all flex items-center gap-1"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                            disabled={processing === user._id}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1 ${
                              user.isActive
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-neon-green hover:bg-neon-green-light text-white"
                            }`}
                            title={user.isActive ? "Khóa user" : "Mở khóa user"}
                          >
                            {user.isActive ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                            {user.isActive ? "Khóa" : "Mở khóa"}
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

        {/* User Details Modal */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] my-4 sm:my-8 flex flex-col shadow-card">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-black text-dark-text pr-2">
                  Chi tiết người dùng
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (selectedUser) {
                        setLoadingDetails(true);
                        try {
                          const res = await fetch(`/api/admin/users/${selectedUser}/details`);
                          if (res.ok) {
                            const data = await res.json();
                            setUserDetails(data);
                            toast.success("Đã làm mới thông tin");
                          }
                        } catch (error) {
                          toast.error("Không thể làm mới");
                        } finally {
                          setLoadingDetails(false);
                        }
                      }
                    }}
                    disabled={loadingDetails}
                    className="p-2 text-dark-text2 hover:text-neon-green transition-colors"
                    title="Làm mới"
                  >
                    <RefreshCw className={`w-5 h-5 ${loadingDetails ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedUser(null);
                      setUserDetails(null);
                      setAdjustAmount("");
                      setAdjustDescription("");
                    }}
                    className="text-dark-text2 hover:text-dark-text transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-12 flex-1">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
                </div>
              ) : userDetails ? (
                <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-1">
                  {/* User Info */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center text-white font-heading font-bold text-2xl">
                        {userDetails.user.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-bold text-dark-text mb-1">
                          {userDetails.user.name}
                        </h3>
                        <p className="text-sm text-dark-text2 mb-2">{userDetails.user.email}</p>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              userDetails.user.role === "admin"
                                ? "bg-purple-500 text-white"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {userDetails.user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              userDetails.user.isActive
                                ? "bg-neon-green text-white"
                                : "bg-dark-text2 text-white"
                            }`}
                          >
                            {userDetails.user.isActive ? "Hoạt động" : "Đã khóa"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet className="w-5 h-5 text-neon-green" />
                        <span className="text-sm text-dark-text2">Số dư</span>
                      </div>
                      <p className="text-2xl font-heading font-black text-neon-green">
                        {formatPrice(userDetails.wallet.balance)} đ
                      </p>
                    </div>
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-dark-text2">Escrow</span>
                      </div>
                      <p className="text-2xl font-heading font-black text-blue-400">
                        {formatPrice(userDetails.wallet.escrow)} đ
                      </p>
                    </div>
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-dark-text2">Tổng kiếm được</span>
                      </div>
                      <p className="text-2xl font-heading font-black text-yellow-400">
                        {formatPrice(userDetails.wallet.totalEarned)} đ
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4 text-center">
                      <Ticket className="w-8 h-8 text-neon-green mx-auto mb-2" />
                      <p className="text-2xl font-heading font-black text-dark-text mb-1">
                        {userDetails.stats.selling}
                      </p>
                      <p className="text-sm text-dark-text2">Vé đang bán</p>
                    </div>
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-heading font-black text-dark-text mb-1">
                        {userDetails.stats.sold}
                      </p>
                      <p className="text-sm text-dark-text2">Vé đã bán</p>
                    </div>
                    <div className="bg-dark-bg border border-dark-border rounded-xl p-4 text-center">
                      <Ticket className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-heading font-black text-dark-text mb-1">
                        {userDetails.stats.purchased}
                      </p>
                      <p className="text-sm text-dark-text2">Vé đã mua</p>
                    </div>
                  </div>

                  {/* Adjust Balance */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-heading font-bold text-dark-text mb-4">
                      Điều chỉnh số dư
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAdjustType("add")}
                          className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                            adjustType === "add"
                              ? "bg-neon-green text-white"
                              : "bg-dark-card border border-dark-border text-dark-text2"
                          }`}
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Cộng tiền
                        </button>
                        <button
                          onClick={() => setAdjustType("subtract")}
                          className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                            adjustType === "subtract"
                              ? "bg-red-500 text-white"
                              : "bg-dark-card border border-dark-border text-dark-text2"
                          }`}
                        >
                          <Minus className="w-4 h-4 inline mr-2" />
                          Trừ tiền
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                          Số tiền (đ)
                        </label>
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="Nhập số tiền"
                          min="1"
                          className="w-full px-4 py-2.5 rounded-xl border border-dark-border bg-dark-card text-dark-text focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                          Lý do <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={adjustDescription}
                          onChange={(e) => setAdjustDescription(e.target.value)}
                          placeholder="VD: Bù lỗi giao dịch, Hoàn tiền..."
                          className="w-full px-4 py-2.5 rounded-xl border border-dark-border bg-dark-card text-dark-text focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
                        />
                      </div>
                      <button
                        onClick={handleAdjustBalance}
                        disabled={adjustingBalance || !adjustAmount || !adjustDescription.trim()}
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                          adjustType === "add"
                            ? "bg-neon-green hover:bg-neon-green-light text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {adjustingBalance ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Đang xử lý...
                          </span>
                        ) : (
                          `${adjustType === "add" ? "Cộng" : "Trừ"} tiền`
                        )}
                      </button>
                    </div>
                  </div>

                  {/* User Tickets */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-heading font-bold text-dark-text mb-4">
                      Gói vé của user ({userDetails.tickets?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {!userDetails.tickets || userDetails.tickets.length === 0 ? (
                        <p className="text-center text-dark-text2 py-4">Chưa có vé nào</p>
                      ) : (
                        userDetails.tickets.map((ticket: UserTicket) => (
                          <div
                            key={ticket._id}
                            className="p-4 bg-dark-card border border-dark-border rounded-xl hover:border-neon-green/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-dark-text truncate">
                                    {ticket.title || ticket.movieTitle}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                      ticket.status === "sold"
                                        ? "bg-neon-green/20 text-neon-green"
                                        : ticket.status === "approved"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : ticket.status === "pending"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : ticket.isExpired
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {ticket.status === "sold"
                                      ? "Đã bán"
                                      : ticket.status === "approved"
                                      ? "Đã duyệt"
                                      : ticket.status === "pending"
                                      ? "Chờ duyệt"
                                      : ticket.isExpired
                                      ? "Hết hạn"
                                      : ticket.status}
                                  </span>
                                  {ticket.isExpired && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                      Hết hạn
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-dark-text2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{ticket.cinema}, {ticket.city}</span>
                                  </div>
                                  {ticket.showDate && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>
                                        {new Date(ticket.showDate).toLocaleDateString("vi-VN")} - {ticket.showTime}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.seats && (
                                    <div className="flex items-center gap-2">
                                      <Ticket className="w-3.5 h-3.5" />
                                      <span>Ghế: {ticket.seats}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-neon-green">
                                      {formatPrice(ticket.sellingPrice)} đ
                                    </span>
                                  </div>
                                  {ticket.buyer && (
                                    <div className="text-xs text-dark-text2 mt-2 pt-2 border-t border-dark-border">
                                      Người mua: {ticket.buyer.name} ({ticket.buyer.email})
                                    </div>
                                  )}
                                  {ticket.seller && ticket.seller._id !== userDetails.user._id && (
                                    <div className="text-xs text-dark-text2 mt-2 pt-2 border-t border-dark-border">
                                      Người bán: {ticket.seller.name} ({ticket.seller.email})
                                    </div>
                                  )}
                                  <div className="text-xs text-dark-text2 mt-1">
                                    Tạo: {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Bạn có chắc muốn xóa vé "${ticket.title || ticket.movieTitle}"? Hành động này không thể hoàn tác.`)) {
                                    return;
                                  }
                                  setDeletingTicket(ticket._id);
                                  try {
                                    const res = await fetch(`/api/admin/tickets/${ticket._id}`, {
                                      method: "DELETE",
                                    });
                                    if (res.ok) {
                                      toast.success("Đã xóa vé thành công");
                                      // Refresh user details
                                      if (selectedUser) {
                                        const detailsRes = await fetch(`/api/admin/users/${selectedUser}/details`);
                                        if (detailsRes.ok) {
                                          const detailsData = await detailsRes.json();
                                          setUserDetails(detailsData);
                                        }
                                      }
                                    } else {
                                      const error = await res.json();
                                      toast.error(error.error || "Không thể xóa vé");
                                    }
                                  } catch (error: any) {
                                    toast.error("Có lỗi xảy ra khi xóa vé");
                                  } finally {
                                    setDeletingTicket(null);
                                  }
                                }}
                                disabled={deletingTicket === ticket._id}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Xóa vé"
                              >
                                {deletingTicket === ticket._id ? (
                                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-heading font-bold text-dark-text mb-4">
                      Giao dịch gần đây ({userDetails.transactions.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userDetails.transactions.length === 0 ? (
                        <p className="text-center text-dark-text2 py-4">Chưa có giao dịch</p>
                      ) : (
                        userDetails.transactions.map((tx: any) => (
                          <div
                            key={tx._id}
                            className="flex items-center justify-between p-3 bg-dark-card border border-dark-border rounded-xl"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-dark-text">
                                {formatTransactionType(tx.type)}
                              </p>
                              <p className="text-xs text-dark-text2">{tx.description}</p>
                              <p className="text-xs text-dark-text2 mt-1">
                                {new Date(tx.createdAt).toLocaleString("vi-VN")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-bold ${
                                  tx.type === "deposit" || tx.type === "refund" || tx.type === "escrow_release"
                                    ? "text-neon-green"
                                    : "text-red-400"
                                }`}
                              >
                                {tx.type === "deposit" || tx.type === "refund" || tx.type === "escrow_release"
                                  ? "+"
                                  : "-"}
                                {formatPrice(tx.amount)} đ
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  tx.status === "completed"
                                    ? "bg-neon-green/20 text-neon-green"
                                    : tx.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {tx.status === "completed"
                                  ? "Hoàn thành"
                                  : tx.status === "pending"
                                  ? "Chờ xử lý"
                                  : "Từ chối"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-dark-text2">
                  Không thể tải thông tin chi tiết
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
