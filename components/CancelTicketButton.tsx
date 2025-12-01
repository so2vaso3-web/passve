"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface CancelTicketButtonProps {
  ticketId: string;
  soldAt?: string | Date;
  createdAt?: string | Date;
}

export function CancelTicketButton({ ticketId, soldAt, createdAt }: CancelTicketButtonProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canCancel, setCanCancel] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const purchaseTime = soldAt ? new Date(soldAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
      const timeElapsed = (Date.now() - purchaseTime) / 1000; // seconds
      const timeLimit = 5 * 60; // 5 minutes in seconds
      const remaining = timeLimit - timeElapsed;
      
      setTimeRemaining(remaining);
      setCanCancel(remaining > 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, [soldAt, createdAt]);

  const handleCancel = async () => {
    // Kiểm tra thời gian trước khi confirm
    const purchaseTime = soldAt ? new Date(soldAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
    const timeElapsed = (Date.now() - purchaseTime) / 1000;
    const timeLimit = 5 * 60;
    
    if (timeElapsed > timeLimit) {
      toast.error("Đã quá 5 phút, không thể hủy vé");
      return;
    }
    
    if (!confirm("Bạn có chắc muốn hủy vé này? Tiền sẽ được hoàn về tài khoản của bạn.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/tickets/${ticketId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Đã hủy vé và hoàn tiền thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi hủy vé");
    }
  };

  if (timeRemaining === null) {
    return null; // Loading state
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);

  return (
    <div className="mb-4 space-y-2">
      {/* Thông báo thời gian hủy vé */}
      {!canCancel ? (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 font-semibold text-center">
            ⚠️ Đã quá 5 phút, không thể hủy vé
          </p>
        </div>
      ) : (
        <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-xs text-orange-400 font-semibold text-center">
            ⏰ Còn {minutes}:{seconds.toString().padStart(2, '0')} để hủy vé và hoàn tiền
          </p>
        </div>
      )}
      
      <button
        onClick={handleCancel}
        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!canCancel}
      >
        Hủy vé / Trả vé
      </button>
    </div>
  );
}

