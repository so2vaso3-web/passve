"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Wallet, AlertCircle, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BuyTicketModalProps {
  ticket: {
    id: string;
    title: string;
    movieTitle: string;
    cinema: string;
    city: string;
    seats: string;
    showDate: string | Date;
    showTime: string;
    sellingPrice: number;
    originalPrice?: number;
    seller: {
      name: string;
      avatar?: string;
    };
  };
  onClose: () => void;
}

export function BuyTicketModal({ ticket, onClose }: BuyTicketModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWalletBalance();
    }
  }, [session]);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setCheckingBalance(false);
    }
  };

  // Platform fee: 7% from buyer
  const platformFee = Math.round(ticket.sellingPrice * 0.07);
  const total = ticket.sellingPrice + platformFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBuy = async () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để mua vé");
      router.push("/api/auth/signin");
      return;
    }

    if (walletBalance === null) {
      toast.error("Đang kiểm tra số dư ví...");
      return;
    }

    if (walletBalance < total) {
      toast.error(`Số dư không đủ! Cần ${formatPrice(total)} đ, hiện có ${formatPrice(walletBalance)} đ`);
      router.push("/profile?tab=wallet");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi mua vé");
      }

      // Show success message
      toast.success("Đã mua vé thành công! Mã vé và ảnh QR code đã được hiển thị.", {
        duration: 5000,
      });

      // Đóng modal và refresh
      onClose();
      router.refresh();
      
      // Redirect đến trang profile tab "Vé đã mua"
      setTimeout(() => {
        router.push("/profile?tab=purchased");
      }, 1000);
    } catch (error: any) {
      console.error("Error buying ticket:", error);
      toast.error(error.message || "Có lỗi xảy ra khi mua vé");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-bold text-dark-text mb-2">
              Cần đăng nhập
            </h3>
            <p className="text-dark-text2 mb-6">
              Vui lòng đăng nhập để mua vé
            </p>
            <button
              onClick={() => router.push("/api/auth/signin")}
              className="w-full bg-neon-green hover:bg-neon-green-light text-white py-3 rounded-xl font-semibold transition-all"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={onClose}
              className="w-full mt-3 text-dark-text2 hover:text-dark-text py-2"
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
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-heading font-black text-dark-text">
            Xác nhận mua vé
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-dark-border transition-colors"
          >
            <X className="w-6 h-6 text-dark-text2" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-5 space-y-3">
            <h3 className="text-lg font-bold text-dark-text mb-3">{ticket.movieTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-text2">Rạp:</span>
                <span className="text-dark-text font-semibold">{ticket.cinema}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Thành phố:</span>
                <span className="text-dark-text font-semibold">{ticket.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Ngày chiếu:</span>
                <span className="text-dark-text font-semibold">{formatDate(ticket.showDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Giờ chiếu:</span>
                <span className="text-dark-text font-semibold">{ticket.showTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Ghế:</span>
                <span className="text-dark-text font-semibold">{ticket.seats}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-dark-text mb-3">Chi tiết thanh toán</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-text2">Giá bán:</span>
                <span className="text-dark-text font-semibold">{formatPrice(ticket.sellingPrice)} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-text2">Phí dịch vụ (7%):</span>
                <span className="text-dark-text font-semibold">{formatPrice(platformFee)} đ</span>
              </div>
              <div className="pt-3 border-t border-dark-border flex justify-between items-center">
                <span className="text-lg font-bold text-dark-text">Tổng phải trả:</span>
                <span className="text-2xl font-black text-neon-green text-glow">
                  {formatPrice(total)} đ
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          {checkingBalance ? (
            <div className="bg-dark-bg border border-dark-border rounded-xl p-4 text-center">
              <p className="text-dark-text2">Đang kiểm tra số dư ví...</p>
            </div>
          ) : (
            <div className={`bg-dark-bg border rounded-xl p-4 ${
              walletBalance && walletBalance >= total
                ? "border-neon-green"
                : "border-red-500"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-dark-text2" />
                  <span className="text-dark-text2 font-semibold">Số dư ví:</span>
                </div>
                <span className={`text-lg font-bold ${
                  walletBalance && walletBalance >= total
                    ? "text-neon-green"
                    : "text-red-500"
                }`}>
                  {formatPrice(walletBalance || 0)} đ
                </span>
              </div>
              {walletBalance !== null && walletBalance < total && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Số dư không đủ! Vui lòng nạp thêm {formatPrice(total - walletBalance)} đ
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-text2">
                <p className="font-semibold text-dark-text mb-1">Hệ thống Escrow</p>
                <p>
                  Tiền sẽ được giữ trong hệ thống escrow. Sau khi bạn thanh toán thành công, mã vé và ảnh QR code sẽ tự động hiển thị cho bạn. Sau khi bạn xác nhận nhận được, tiền mới được chuyển cho người bán.
                </p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
            <p className="text-sm text-dark-text2 mb-2">Người bán:</p>
            <div className="flex items-center gap-3">
              {ticket.seller.avatar ? (
                <img
                  src={ticket.seller.avatar}
                  alt={ticket.seller.name}
                  className="w-10 h-10 rounded-full border border-dark-border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center text-white font-bold">
                  {ticket.seller.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-dark-text">{ticket.seller.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-card border-t border-dark-border p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text font-semibold hover:bg-dark-border transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleBuy}
            disabled={loading || checkingBalance || (walletBalance !== null && walletBalance < total)}
            className="flex-1 px-6 py-3 bg-neon-green hover:bg-neon-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-neon-sm hover:shadow-neon transition-all"
          >
            {loading ? "Đang xử lý..." : "Thanh toán ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Wallet, AlertCircle, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BuyTicketModalProps {
  ticket: {
    id: string;
    title: string;
    movieTitle: string;
    cinema: string;
    city: string;
    seats: string;
    showDate: string | Date;
    showTime: string;
    sellingPrice: number;
    originalPrice?: number;
    seller: {
      name: string;
      avatar?: string;
    };
  };
  onClose: () => void;
}

export function BuyTicketModal({ ticket, onClose }: BuyTicketModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWalletBalance();
    }
  }, [session]);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setCheckingBalance(false);
    }
  };

  // Platform fee: 7% from buyer
  const platformFee = Math.round(ticket.sellingPrice * 0.07);
  const total = ticket.sellingPrice + platformFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBuy = async () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để mua vé");
      router.push("/api/auth/signin");
      return;
    }

    if (walletBalance === null) {
      toast.error("Đang kiểm tra số dư ví...");
      return;
    }

    if (walletBalance < total) {
      toast.error(`Số dư không đủ! Cần ${formatPrice(total)} đ, hiện có ${formatPrice(walletBalance)} đ`);
      router.push("/profile?tab=wallet");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi mua vé");
      }

      // Show success message
      toast.success("Đã mua vé thành công! Mã vé và ảnh QR code đã được hiển thị.", {
        duration: 5000,
      });

      // Đóng modal và refresh
      onClose();
      router.refresh();
      
      // Redirect đến trang profile tab "Vé đã mua"
      setTimeout(() => {
        router.push("/profile?tab=purchased");
      }, 1000);
    } catch (error: any) {
      console.error("Error buying ticket:", error);
      toast.error(error.message || "Có lỗi xảy ra khi mua vé");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-bold text-dark-text mb-2">
              Cần đăng nhập
            </h3>
            <p className="text-dark-text2 mb-6">
              Vui lòng đăng nhập để mua vé
            </p>
            <button
              onClick={() => router.push("/api/auth/signin")}
              className="w-full bg-neon-green hover:bg-neon-green-light text-white py-3 rounded-xl font-semibold transition-all"
            >
              Đăng nhập ngay
            </button>
            <button
              onClick={onClose}
              className="w-full mt-3 text-dark-text2 hover:text-dark-text py-2"
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
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-neon max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-heading font-black text-dark-text">
            Xác nhận mua vé
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-dark-border transition-colors"
          >
            <X className="w-6 h-6 text-dark-text2" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-5 space-y-3">
            <h3 className="text-lg font-bold text-dark-text mb-3">{ticket.movieTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-text2">Rạp:</span>
                <span className="text-dark-text font-semibold">{ticket.cinema}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Thành phố:</span>
                <span className="text-dark-text font-semibold">{ticket.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Ngày chiếu:</span>
                <span className="text-dark-text font-semibold">{formatDate(ticket.showDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Giờ chiếu:</span>
                <span className="text-dark-text font-semibold">{ticket.showTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text2">Ghế:</span>
                <span className="text-dark-text font-semibold">{ticket.seats}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-dark-text mb-3">Chi tiết thanh toán</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-text2">Giá bán:</span>
                <span className="text-dark-text font-semibold">{formatPrice(ticket.sellingPrice)} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-text2">Phí dịch vụ (7%):</span>
                <span className="text-dark-text font-semibold">{formatPrice(platformFee)} đ</span>
              </div>
              <div className="pt-3 border-t border-dark-border flex justify-between items-center">
                <span className="text-lg font-bold text-dark-text">Tổng phải trả:</span>
                <span className="text-2xl font-black text-neon-green text-glow">
                  {formatPrice(total)} đ
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          {checkingBalance ? (
            <div className="bg-dark-bg border border-dark-border rounded-xl p-4 text-center">
              <p className="text-dark-text2">Đang kiểm tra số dư ví...</p>
            </div>
          ) : (
            <div className={`bg-dark-bg border rounded-xl p-4 ${
              walletBalance && walletBalance >= total
                ? "border-neon-green"
                : "border-red-500"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-dark-text2" />
                  <span className="text-dark-text2 font-semibold">Số dư ví:</span>
                </div>
                <span className={`text-lg font-bold ${
                  walletBalance && walletBalance >= total
                    ? "text-neon-green"
                    : "text-red-500"
                }`}>
                  {formatPrice(walletBalance || 0)} đ
                </span>
              </div>
              {walletBalance !== null && walletBalance < total && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Số dư không đủ! Vui lòng nạp thêm {formatPrice(total - walletBalance)} đ
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-text2">
                <p className="font-semibold text-dark-text mb-1">Hệ thống Escrow</p>
                <p>
                  Tiền sẽ được giữ trong hệ thống escrow. Sau khi bạn thanh toán thành công, mã vé và ảnh QR code sẽ tự động hiển thị cho bạn. Sau khi bạn xác nhận nhận được, tiền mới được chuyển cho người bán.
                </p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
            <p className="text-sm text-dark-text2 mb-2">Người bán:</p>
            <div className="flex items-center gap-3">
              {ticket.seller.avatar ? (
                <img
                  src={ticket.seller.avatar}
                  alt={ticket.seller.name}
                  className="w-10 h-10 rounded-full border border-dark-border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center text-white font-bold">
                  {ticket.seller.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-dark-text">{ticket.seller.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-card border-t border-dark-border p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text font-semibold hover:bg-dark-border transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleBuy}
            disabled={loading || checkingBalance || (walletBalance !== null && walletBalance < total)}
            className="flex-1 px-6 py-3 bg-neon-green hover:bg-neon-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-neon-sm hover:shadow-neon transition-all"
          >
            {loading ? "Đang xử lý..." : "Thanh toán ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}

