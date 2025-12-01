"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Copy, CheckCircle, Building2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function SePayPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (transactionId) {
      // Lấy thông tin từ localStorage hoặc fetch từ API
      const saved = localStorage.getItem("sepayPayment");
      if (saved) {
        const info = JSON.parse(saved);
        if (info.transactionId === transactionId) {
          setPaymentInfo(info);
          setLoading(false);
          return;
        }
      }

      // Nếu không có trong localStorage, fetch từ API
      const fetchPaymentInfo = async () => {
        try {
          const res = await fetch(`/api/sepay/payment-info?transactionId=${transactionId}`);
          if (res.ok) {
            const data = await res.json();
            setPaymentInfo(data);
          }
        } catch (error) {
          console.error("Error fetching payment info:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentInfo();
    } else {
      setLoading(false);
    }
  }, [transactionId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-[#0F172A] py-12 px-4">
        <div className="max-w-md mx-auto bg-[#1E293B] border border-[#475569] rounded-2xl shadow-lg p-8 text-center">
          <p className="text-[#CBD5E1] mb-4">Không tìm thấy thông tin thanh toán</p>
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Về trang cá nhân
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-md mx-auto bg-[#1E293B] border border-[#475569] rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Thanh toán qua SePay</h1>
          <p className="text-[#CBD5E1]">
            Số tiền: <span className="font-bold text-[#10B981]">
              {new Intl.NumberFormat("vi-VN").format(paymentInfo.amount)} đ
            </span>
          </p>
        </div>

        {paymentInfo.qrCode && (
          <div className="mb-6 text-center">
            <p className="text-sm text-[#CBD5E1] mb-3">Quét mã QR để thanh toán</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <Image
                src={paymentInfo.qrCode.startsWith("data:") ? paymentInfo.qrCode : `data:image/png;base64,${paymentInfo.qrCode}`}
                alt="QR Code"
                width={250}
                height={250}
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        )}

        {paymentInfo.vaNumber && (
          <div className="mb-6">
            <p className="text-sm text-[#CBD5E1] mb-2">Chuyển khoản đến số tài khoản:</p>
            <div className="bg-[#0F172A] border border-[#475569] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#CBD5E1]">Số tài khoản:</span>
                <span className="font-bold text-[#F1F5F9] text-lg">{paymentInfo.vaNumber}</span>
              </div>
              {paymentInfo.bankName && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#CBD5E1]">Ngân hàng:</span>
                  <span className="font-semibold text-[#F1F5F9]">{paymentInfo.bankName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#CBD5E1]">Số tiền:</span>
                <span className="font-bold text-[#10B981]">
                  {new Intl.NumberFormat("vi-VN").format(paymentInfo.amount)} đ
                </span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(paymentInfo.vaNumber)}
              className="w-full mt-3 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Sao chép số tài khoản
                </>
              )}
            </button>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-400">
            ⚠️ Vui lòng chuyển khoản đúng số tiền và nội dung. Tiền sẽ được cộng vào ví tự động sau khi thanh toán thành công.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/profile")}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Đã thanh toán
          </button>
          <button
            onClick={() => router.back()}
            className="w-full border-2 border-[#475569] text-[#F1F5F9] hover:bg-[#0F172A] px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

