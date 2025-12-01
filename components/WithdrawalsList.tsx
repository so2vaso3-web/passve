"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BackButton } from "./BackButton";

interface Withdrawal {
  _id: string;
  amount: number;
  description: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  bankAccount?: string;
}

interface WithdrawalsListProps {
  withdrawals: Withdrawal[];
}

export function WithdrawalsList({ withdrawals: initialWithdrawals }: WithdrawalsListProps) {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm("Xác nhận đã chuyển tiền và duyệt yêu cầu này?")) return;

    setProcessing(withdrawalId);
    try {
      const res = await fetch(`/api/admin/withdraw/${withdrawalId}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success("Đã duyệt yêu cầu rút tiền");
      setWithdrawals(withdrawals.filter((w) => w._id !== withdrawalId));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;

    setProcessing(withdrawalId);
    try {
      const res = await fetch(`/api/admin/withdraw/${withdrawalId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success("Đã từ chối yêu cầu");
      setWithdrawals(withdrawals.filter((w) => w._id !== withdrawalId));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Duyệt rút tiền
          </h1>
          <p className="text-dark-text2">
            {withdrawals.length} yêu cầu đang chờ duyệt
          </p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center shadow-card">
            <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <p className="text-dark-text2 text-lg">Không có yêu cầu nào đang chờ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-card hover:shadow-neon hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-dark-text2" />
                      <div>
                        <p className="font-heading font-bold text-dark-text">
                          {withdrawal.user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-dark-text2">{withdrawal.user?.email}</p>
                      </div>
                    </div>
                    <p className="text-dark-text2 mb-2">{withdrawal.description}</p>
                    <p className="text-sm text-dark-text2">
                      {new Date(withdrawal.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-heading font-black text-neon-green-light text-glow mb-2">
                      {new Intl.NumberFormat("vi-VN").format(withdrawal.amount)} đ
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(withdrawal._id)}
                        disabled={processing === withdrawal._id}
                        className="px-4 py-2 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-neon hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">Đã chuyển</span>
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal._id)}
                        disabled={processing === withdrawal._id}
                        className="px-4 py-2 border-2 border-red-500 text-red-400 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="font-bold">Từ chối</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
