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
        console.log(`🔄 Calling verify-payment API for transaction ${transactionId}`);
        const processRes = await fetch(`/api/sepay/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: transactionId }),
        });

        if (processRes.ok) {
          const processData = await processRes.json();
          console.log(`📥 Verify-payment response:`, processData);
          
          if (processData.success) {
            // Reload transaction để lấy status mới
            const refreshRes = await fetch(`/api/transactions/${transactionId}`);
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              setTransaction(refreshData.transaction);
              const isCompleted = (refreshData.transaction?.status as string) === "completed";
              console.log(`✅ Payment verification result: ${isCompleted ? 'COMPLETED' : 'PENDING'}`);
              return isCompleted;
            }
          } else {
            console.error(`❌ Verify-payment failed:`, processData.message || processData.error);
          }
        } else {
          const errorData = await processRes.json().catch(() => ({}));
          console.error(`❌ Verify-payment API error (${processRes.status}):`, errorData);
        }
      } catch (processError: any) {
        console.error("❌ Error processing payment:", processError);
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

          // Nếu transaction vẫn pending, LUÔN LUÔN verify và process payment ngay lập tức
          // Vì nếu user đã về success page, payment đã thành công rồi
          if (tx && (tx.status as string) === "pending") {
            console.log("🔄 Transaction pending, verifying payment immediately...");
            // Retry verify-payment nhiều lần để đảm bảo thành công
            let retryCount = 0;
            const maxRetries = 3;
            let processed = false;
            
            while (retryCount < maxRetries && !processed) {
              retryCount++;
              console.log(`🔄 Verify attempt ${retryCount}/${maxRetries}`);
              processed = await verifyAndProcessPayment();
              
              if (processed) {
                console.log("✅ Payment processed successfully!");
                // Refresh transaction status
                const refreshRes = await fetch(`/api/transactions/${transactionId}`);
                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json();
                  setTransaction(refreshData.transaction);
                }
                setLoading(false);
                break;
              } else {
                // Đợi 1 giây trước khi retry
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            if (!processed) {
              console.log("⏳ Payment still not processed, starting polling...");
              startPolling();
            }
          } else if (tx && (tx.status as string) === "completed") {
            console.log("✅ Transaction already completed");
            setLoading(false);
          } else {
            // Transaction không tồn tại hoặc có status khác
            console.log("⚠️ Transaction status unknown, showing success page anyway");
            setLoading(false);
          }
        } else {
          // API trả về lỗi
          console.error("Failed to fetch transaction:", res.status);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
        setLoading(false);
      }
    };

    // Polling function để check lại sau mỗi 3 giây (tối đa 5 lần = 15 giây)
    let pollCount = 0;
    const maxPolls = 5; // Giảm từ 10 xuống 5 để không làm user chờ quá lâu
    
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
            } else {
              // Đạt max polls hoặc status không phải pending/completed
              console.log("⏱️ Polling timeout, showing success page (payment will be processed by webhook)");
              clearInterval(pollInterval);
              setLoading(false);
            }
          } else {
            // API lỗi, dừng polling
            console.error("Failed to fetch transaction during polling:", res.status);
            clearInterval(pollInterval);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error polling transaction:", error);
          clearInterval(pollInterval);
          setLoading(false);
        }
      }, 3000); // Poll mỗi 3 giây
      
      // Timeout tổng thể sau 20 giây để đảm bảo loading không bao giờ bị stuck
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          console.log("⏱️ Global timeout reached, stopping polling");
          setLoading(false);
        }
      }, 20000);
    };

    // Bắt đầu check ngay lập tức
    checkTransactionStatus();
    
    // Timeout tổng thể để đảm bảo loading không bao giờ bị stuck quá 30 giây
    const globalTimeout = setTimeout(() => {
      console.log("⏱️ Global timeout: Stopping loading");
      setLoading(false);
    }, 30000);
    
    // Cleanup
    return () => {
      clearTimeout(globalTimeout);
    };
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



