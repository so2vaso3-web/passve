"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types/ticket";
import { Lightbulb } from "lucide-react";
import toast from "react-hot-toast";

interface BuyTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function BuyTicketModal({ ticket, onClose }: BuyTicketModalProps) {
  const { data: session } = useSession();
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "vnpay">("momo");
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket._id,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const platformFee = ticket.sellingPrice * 0.12;
  const total = ticket.sellingPrice;

  return (
    <Modal isOpen={true} onClose={onClose} title="Thanh toán" size="md">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-dark-600 dark:text-dark-400">Giá vé:</span>
            <span className="font-medium">{formatPrice(ticket.sellingPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-600 dark:text-dark-400">Phí platform (12%):</span>
            <span className="font-medium">{formatPrice(platformFee)}</span>
          </div>
          <div className="pt-2 border-t border-dark-200 dark:border-dark-700 flex justify-between">
            <span className="font-semibold text-lg">Tổng cộng:</span>
            <span className="font-bold text-xl text-primary-500">{formatPrice(total)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Phương thức thanh toán
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-dark-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500">
              <input
                type="radio"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value as "momo")}
                className="w-4 h-4 text-primary-500"
              />
              <span>Ví MoMo</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-dark-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500">
              <input
                type="radio"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value as "vnpay")}
                className="w-4 h-4 text-primary-500"
              />
              <span>VNPay</span>
            </label>
          </div>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Tiền sẽ được giữ trong hệ thống escrow. Sau khi người bán gửi mã vé và bạn xác nhận nhận được, tiền mới được chuyển cho người bán.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button onClick={handleBuy} isLoading={loading} className="flex-1">
            Thanh toán
          </Button>
        </div>
      </div>
    </Modal>
  );
}