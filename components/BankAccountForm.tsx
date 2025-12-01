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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl max-w-md w-full p-7 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-7 pb-5 border-b border-slate-700/50">
            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
              {account?._id ? "Sửa tài khoản" : "Thêm tài khoản ngân hàng"}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl p-2 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Ngân hàng <span className="text-red-400">*</span>
              </label>
              <BankSelect
                value={formData.bankName}
                onChange={(value) => setFormData({ ...formData, bankName: value })}
                placeholder="Chọn ngân hàng"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Số tài khoản <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="VD: 1234567890"
                className="w-full px-4 py-3.5 border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 text-white placeholder-slate-400 transition-all backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Tên chủ tài khoản <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="VD: NGUYEN VAN A"
                className="w-full px-4 py-3.5 border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 text-white placeholder-slate-400 transition-all uppercase backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                Chi nhánh <span className="text-slate-400 text-xs font-normal">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="VD: Hà Nội"
                className="w-full px-4 py-3.5 border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 text-white placeholder-slate-400 transition-all backdrop-blur-sm"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-5 h-5 mt-0.5 text-emerald-500 rounded border-slate-600 focus:ring-2 focus:ring-emerald-500/50 bg-slate-800 cursor-pointer accent-emerald-500"
              />
              <label htmlFor="isDefault" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                Đặt làm mặc định <span className="text-slate-400">(tự động điền khi rút tiền)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98]"
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
                className="px-6 py-3.5 border-2 border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 hover:text-white hover:border-slate-600 transition-all active:scale-[0.98] backdrop-blur-sm"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

