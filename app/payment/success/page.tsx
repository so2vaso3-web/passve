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
    if (!transactionId) {
      setLoading(false);
      return;
    }

    // Function để verify và process payment
    const verifyAndProcessPayment = async (): Promise<boolean> => {
      try {
        const processRes = await fetch(`/api/sepay/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: transactionId }),
        });

        if (processRes.ok) {
          const processData = await processRes.json();
          if (processData.success) {
            // Reload transaction để lấy status mới
            const refreshRes = await fetch(`/api/transactions/${transactionId}`);
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              setTransaction(refreshData.transaction);
              return (refreshData.transaction?.status as string) === "completed";
            }
          }
        }
      } catch (processError) {
        console.error("Error processing payment:", processError);
      }
      return false;
    };

    // Function để check transaction status
    const checkTransactionStatus = async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}`);
        if (res.ok) {
          const data = await res.json();
          const tx = data.transaction;
          setTransaction(tx);

            // Nếu transaction vẫn pending, thử verify và process payment ngay lập tức
            if (tx && (tx.status as string) === "pending") {
            console.log("🔄 Transaction pending, verifying payment...");
            const processed = await verifyAndProcessPayment();
            
            if (!processed) {
              // Nếu chưa được process, bắt đầu polling
              console.log("⏳ Payment not processed yet, starting polling...");
              startPolling();
            } else {
              console.log("✅ Payment processed successfully!");
              setLoading(false);
            }
          } else if (tx && (tx.status as string) === "completed") {
            console.log("✅ Transaction already completed");
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
        setLoading(false);
      }
    };

    // Polling function để check lại sau mỗi 3 giây (tối đa 10 lần = 30 giây)
    let pollCount = 0;
    const maxPolls = 10;
    
    const startPolling = () => {
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`🔄 Polling attempt ${pollCount}/${maxPolls}...`);
        
        try {
          const res = await fetch(`/api/transactions/${transactionId}`);
          if (res.ok) {
            const data = await res.json();
            const tx = data.transaction;
            
            if (tx && (tx.status as string) === "completed") {
              console.log("✅ Payment completed via polling!");
              setTransaction(tx);
              clearInterval(pollInterval);
              setLoading(false);
              return;
            }
            
            // Nếu vẫn pending và chưa đạt max polls, thử verify lại
            if (tx && (tx.status as string) === "pending" && pollCount < maxPolls) {
              await verifyAndProcessPayment();
            } else if (pollCount >= maxPolls) {
              console.log("⏱️ Polling timeout, but transaction may still be processing");
              clearInterval(pollInterval);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error polling transaction:", error);
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }
      }, 3000); // Poll mỗi 3 giây
    };

    // Bắt đầu check ngay lập tức
    checkTransactionStatus();
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



