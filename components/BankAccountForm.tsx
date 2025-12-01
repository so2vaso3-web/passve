"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { BANKS } from "@/lib/banks";
import toast from "react-hot-toast";
import { BankIcon } from "./BankIcon";
import { BankSelect } from "./BankSelect";

interface BankAccount {
  _id?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isDefault: boolean;
}

interface BankAccountFormProps {
  account?: BankAccount;
  onClose: () => void;
  onSuccess: () => void;
}

export function BankAccountForm({ account, onClose, onSuccess }: BankAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BankAccount>({
    bankName: account?.bankName || "",
    accountNumber: account?.accountNumber || "",
    accountHolder: account?.accountHolder || "",
    branch: account?.branch || "",
    isDefault: account?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = account?._id 
        ? `/api/bank/${account._id}`
        : "/api/bank";
      
      const method = account?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success(account?._id ? "Đã cập nhật tài khoản" : "Đã thêm tài khoản");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
          <h3 className="text-2xl font-heading font-bold text-dark-text">
            {account?._id ? "Sửa tài khoản" : "Thêm tài khoản ngân hàng"}
          </h3>
          <button
            onClick={onClose}
            className="text-dark-text2 hover:text-dark-text hover:bg-dark-border rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2.5">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <BankSelect
              value={formData.bankName}
              onChange={(value) => setFormData({ ...formData, bankName: value })}
              placeholder="Chọn ngân hàng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2.5">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="VD: 1234567890"
              className="w-full px-4 py-3.5 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green bg-dark-card-bright text-dark-text placeholder-dark-text2 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2.5">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="VD: NGUYEN VAN A"
              className="w-full px-4 py-3.5 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green bg-dark-card-bright text-dark-text placeholder-dark-text2 transition-all uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2.5">
              Chi nhánh <span className="text-dark-text2 text-xs">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              placeholder="VD: Hà Nội"
              className="w-full px-4 py-3.5 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green bg-dark-card-bright text-dark-text placeholder-dark-text2 transition-all"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-border">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 mt-0.5 text-neon-green rounded border-dark-border focus:ring-2 focus:ring-neon-green/50 bg-dark-card-bright cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-sm text-dark-text2 leading-relaxed cursor-pointer">
              Đặt làm mặc định <span className="text-dark-text2/70">(tự động điền khi rút tiền)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-neon active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-dark-border text-dark-text2 rounded-xl font-medium hover:bg-dark-border hover:text-dark-text hover:border-dark-text2 transition-all active:scale-[0.98]"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

