"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Shield } from "lucide-react";

interface CancelTicketButtonProps {
  ticketId: string;
  soldAt?: string | Date;
  createdAt?: string | Date;
  showAdminButton?: boolean;
}

export function CancelTicketButton({ ticketId, soldAt, createdAt, showAdminButton = true }: CancelTicketButtonProps) {
  const { data: session } = useSession();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canCancel, setCanCancel] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(5);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (session?.user) {
      const userRole = (session.user as any)?.role;
      setIsAdmin(userRole === "admin");
    }
    
    // Fetch time limit from settings
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.cancellationTimeLimitMinutes) {
          setTimeLimitMinutes(data.settings.cancellationTimeLimitMinutes);
        }
      })
      .catch(() => {
        // Use default if error
      });
  }, [session]);

  useEffect(() => {
    const updateCountdown = () => {
      const purchaseTime = soldAt ? new Date(soldAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
      const timeElapsed = (Date.now() - purchaseTime) / 1000; // seconds
      const timeLimit = timeLimitMinutes * 60; // Convert minutes to seconds
      const remaining = timeLimit - timeElapsed;
      
      setTimeRemaining(remaining);
      setCanCancel(remaining > 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, [soldAt, createdAt, timeLimitMinutes]);

  const handleCancel = async (isAdminCancel: boolean = false) => {
    // Kiểm tra thời gian trước khi confirm (chỉ cho user thường)
    if (!isAdminCancel) {
      const purchaseTime = soldAt ? new Date(soldAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
      const timeElapsed = (Date.now() - purchaseTime) / 1000;
      const timeLimit = timeLimitMinutes * 60;
      
      if (timeElapsed > timeLimit) {
        toast.error(`Đã quá ${timeLimitMinutes} phút, không thể hủy vé`);
        return;
      }
    }
    
    const confirmMessage = isAdminCancel
      ? "Bạn có chắc muốn hủy vé này với quyền admin? Tiền sẽ được hoàn về tài khoản người mua."
      : "Bạn có chắc muốn hủy vé này? Tiền sẽ được hoàn về tài khoản của bạn.";
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/tickets/${ticketId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminCancel: isAdminCancel }),
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
            ⚠️ Đã quá {timeLimitMinutes} phút, không thể hủy vé
          </p>
        </div>
      ) : (
        <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-xs text-orange-400 font-semibold text-center">
            ⏰ Còn {minutes}:{seconds.toString().padStart(2, '0')} để hủy vé và hoàn tiền
          </p>
        </div>
      )}
      
      {/* User cancel button */}
      <button
        onClick={() => handleCancel(false)}
        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!canCancel}
      >
        Hủy vé / Trả vé
      </button>

      {/* Admin cancel button (only show if admin and time exceeded) */}
      {isAdmin && !canCancel && showAdminButton && (
        <button
          onClick={() => handleCancel(true)}
          className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-center transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin: Hủy vé trả về
        </button>
      )}
    </div>
  );
}

