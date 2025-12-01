"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-gray-dark mb-4">
          Có lỗi xảy ra
        </h1>
        <p className="text-gray mb-6">
          {error.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-heading font-bold transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="bg-white border border-gray-light text-gray-dark px-6 py-3 rounded-lg font-heading font-bold hover:bg-gray-light transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

