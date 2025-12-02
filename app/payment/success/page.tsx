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

    // Function để verify và process payment - QUAN TRỌNG: Phải process ngay khi vào success page
    const verifyAndProcessPayment = async (): Promise<boolean> => {
      try {
        console.log(`🔄 [${new Date().toISOString()}] Calling verify-payment API for transaction ${transactionId}`);
        const processRes = await fetch(`/api/sepay/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: transactionId }),
        });

        console.log(`📥 [${new Date().toISOString()}] Verify-payment response status: ${processRes.status}`);

        if (processRes.ok) {
          const processData = await processRes.json();
          console.log(`📥 Verify-payment response data:`, processData);
          
          if (processData.success) {
            // Đợi 500ms để đảm bảo database đã được update
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reload transaction để lấy status mới - retry nhiều lần nếu cần
            let retryCount = 0;
            let isCompleted = false;
            
            while (retryCount < 3 && !isCompleted) {
              retryCount++;
              const refreshRes = await fetch(`/api/transactions/${transactionId}?t=${Date.now()}`);
              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setTransaction(refreshData.transaction);
                isCompleted = (refreshData.transaction?.status as string) === "completed";
                console.log(`🔄 [Retry ${retryCount}] Transaction status check: ${refreshData.transaction?.status}`);
                
                if (isCompleted) {
                  console.log(`✅ Payment verification SUCCESS: Transaction is COMPLETED`);
                  return true;
                }
              }
              
              if (!isCompleted && retryCount < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            console.log(`⚠️ Payment verification: Transaction status still not completed after ${retryCount} retries`);
            return isCompleted;
          } else {
            console.error(`❌ Verify-payment returned success=false:`, processData.message || processData.error);
          }
        } else {
          const errorData = await processRes.json().catch(() => ({}));
          console.error(`❌ Verify-payment API error (${processRes.status}):`, errorData);
        }
      } catch (processError: any) {
        console.error(`❌ Error processing payment:`, processError);
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

          // QUAN TRỌNG: Nếu transaction vẫn pending, PHẢI verify và process payment ngay lập tức
          // Vì nếu user đã về success page = SePay đã confirm payment thành công rồi
          if (tx && (tx.status as string) === "pending") {
            console.log(`🚨 [${new Date().toISOString()}] Transaction is PENDING - Processing payment NOW...`);
            
            // Process ngay lập tức - không chờ
            const processed = await verifyAndProcessPayment();
            
            if (processed) {
              console.log("✅✅✅ Payment processed successfully - Transaction completed!");
              setLoading(false);
              // Refresh lại để hiển thị transaction mới nhất
              setTimeout(async () => {
                const refreshRes = await fetch(`/api/transactions/${transactionId}?t=${Date.now()}`);
                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json();
                  setTransaction(refreshData.transaction);
                }
              }, 500);
            } else {
              console.log("⚠️ Payment not processed immediately, retrying...");
              // Retry ngay lập tức thêm 2 lần nữa
              let retryCount = 0;
              const maxRetries = 2;
              let finallyProcessed = false;
              
              while (retryCount < maxRetries && !finallyProcessed) {
                retryCount++;
                console.log(`🔄 Retry attempt ${retryCount}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                finallyProcessed = await verifyAndProcessPayment();
                
                if (finallyProcessed) {
                  console.log("✅✅ Payment processed on retry!");
                  setLoading(false);
                  setTimeout(async () => {
                    const refreshRes = await fetch(`/api/transactions/${transactionId}?t=${Date.now()}`);
                    if (refreshRes.ok) {
                      const refreshData = await refreshRes.json();
                      setTransaction(refreshData.transaction);
                    }
                  }, 500);
                  return;
                }
              }
              
              if (!finallyProcessed) {
                console.log("⏳ Still pending after retries, starting polling as fallback...");
                startPolling();
              }
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

    // Bắt đầu check ngay lập tức - KHÔNG chờ gì cả
    console.log(`🚀 [${new Date().toISOString()}] Starting payment verification for transaction ${transactionId}`);
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



