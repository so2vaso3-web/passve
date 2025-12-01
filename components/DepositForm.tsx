"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CreditCard, Building2 } from "lucide-react";

interface DepositFormProps {
  userId: string;
  onClose?: () => void;
  onSuccess?: () => void | Promise<void>;
}

export function DepositForm({ userId, onClose, onSuccess }: DepositFormProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    // Parse amount (remove formatting)
    const numericAmount = parseFloat(amount.replace(/\D/g, ""));

    // Validate: phải là số hợp lệ và >= 10000
    if (!amount || isNaN(numericAmount) || numericAmount < 10000) {
      toast.error("Số tiền tối thiểu là 10,000 VNĐ", { id: "min-amount-error" });
      return;
    }

    setLoading(true);
    try {
      // Tạo payment qua SePay
      const response = await fetch("/api/sepay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount, // Use parsed numeric amount
          description: `Nạp tiền ${new Intl.NumberFormat("vi-VN").format(numericAmount)} đ vào ví`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi tạo payment");
      }

      const data = await response.json();
      
      if (data.checkoutUrl && data.checkoutFormfields) {
        // Tạo form và submit tự động theo code mẫu SePay
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.checkoutUrl;
        
        // Thêm các hidden fields
        Object.keys(data.checkoutFormfields).forEach((field) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = field;
          input.value = data.checkoutFormfields[field];
          form.appendChild(input);
        });
        
        // Thêm form vào body và submit
        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error("Không nhận được thông tin thanh toán");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num ? new Intl.NumberFormat("vi-VN").format(parseInt(num)) : "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setAmount(formatted);
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-neon-green/20 rounded-full flex items-center justify-center text-neon-green">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-dark-text">Nạp tiền vào ví</h3>
          <p className="text-sm text-dark-text2">Nạp tiền nhanh chóng và an toàn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin nạp tiền ngân hàng */}
        <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-neon-green" />
            <p className="font-semibold text-dark-text">Nạp tiền ngân hàng nhanh chóng</p>
          </div>
          <p className="text-sm text-dark-text2">
            Hỗ trợ thanh toán qua tất cả các ngân hàng trong nước. Giao dịch được xử lý tự động, tiền sẽ được cộng vào ví ngay lập tức sau khi thanh toán thành công. Bảo mật tuyệt đối với công nghệ mã hóa SSL.
          </p>
        </div>
        {/* Số tiền */}
        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2">
            Số tiền nạp (VNĐ) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Nhập số tiền"
              className="w-full px-4 py-3 pr-12 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text text-lg font-bold bg-dark-card-bright"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-text2 text-sm font-medium">
              đ
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(formatCurrency(amt.toString()))}
                className="px-4 py-2 bg-dark-card hover:bg-dark-border rounded-xl text-sm font-semibold text-dark-text transition-colors border border-dark-border"
              >
                {new Intl.NumberFormat("vi-VN").format(amt)} đ
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-neon-green hover:bg-neon-green-light text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-neon"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5" />
              <span className="font-bold">Nạp {amount ? `${amount} đ` : "tiền"}</span>
            </>
          )}
        </button>

        <p className="text-xs text-dark-text2 text-center">
          * Tiền sẽ được cập nhật ngay sau khi nạp thành công
        </p>
      </form>
    </div>
  );
}
