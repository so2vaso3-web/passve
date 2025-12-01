"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-md mx-auto bg-dark-card border border-dark-border rounded-2xl shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-dark-text mb-2">Thanh toán đã hủy</h1>
        <p className="text-dark-text2 mb-6">
          Bạn đã hủy giao dịch thanh toán. Tiền chưa được trừ khỏi tài khoản.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-neon-green hover:bg-neon-green-light text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Thử lại
          </button>
          <Link
            href="/profile"
            className="block w-full border-2 border-dark-border text-dark-text hover:bg-dark-bg px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Về trang cá nhân
          </Link>
        </div>
      </div>
    </div>
  );
}



