"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    if (transactionId) {
      // Check transaction status
      const checkTransaction = async () => {
        try {
          const res = await fetch(`/api/transactions/${transactionId}`);
          if (res.ok) {
            const data = await res.json();
            setTransaction(data.transaction);
          }
        } catch (error) {
          console.error("Error checking transaction:", error);
        } finally {
          setLoading(false);
        }
      };
      checkTransaction();
    } else {
      setLoading(false);
    }
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-md mx-auto bg-dark-card border border-dark-border rounded-2xl shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-neon-green" />
        </div>
        <h1 className="text-2xl font-bold text-dark-text mb-2">Thanh toán thành công!</h1>
        <p className="text-dark-text2 mb-6">
          {transaction?.amount
            ? `Bạn đã nạp ${new Intl.NumberFormat("vi-VN").format(transaction.amount)} đ vào ví`
            : "Giao dịch đã được xử lý thành công"}
        </p>
        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full bg-neon-green hover:bg-neon-green-light text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Xem ví của tôi
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-dark-border text-dark-text hover:bg-dark-bg px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

