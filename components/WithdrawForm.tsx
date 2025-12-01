"use client";

import { useState, useEffect } from "react";
import { X, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isDefault: boolean;
}

interface WithdrawFormProps {
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawForm({ balance, onClose, onSuccess }: WithdrawFormProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>("");

  useEffect(() => {
    fetch("/api/bank")
      .then((res) => res.json())
      .then((data) => {
        if (data.bankAccounts) {
          setBankAccounts(data.bankAccounts);
          const defaultBank = data.bankAccounts.find((b: BankAccount) => b.isDefault);
          if (defaultBank) {
            setSelectedBank(defaultBank._id);
          } else if (data.bankAccounts.length > 0) {
            setSelectedBank(data.bankAccounts[0]._id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBank) {
      toast.error("Vui lòng chọn tài khoản ngân hàng");
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 50000) {
      toast.error("Số tiền phải lớn hơn 50,000 VNĐ");
      return;
    }

    if (amountNum > balance) {
      toast.error("Số dư không đủ");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, bankAccountId: selectedBank }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success("Đã gửi yêu cầu rút tiền. Admin sẽ duyệt trong vòng 24h.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-dark-card border border-dark-border max-w-md w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-card my-4 sm:my-8 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-dark-text pr-2">Rút tiền</h3>
          <button onClick={onClose} className="text-dark-text2 hover:text-dark-text flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-text2 mb-4">Bạn chưa có tài khoản ngân hàng</p>
            <p className="text-sm text-dark-text2 mb-4">Vui lòng thêm tài khoản ngân hàng trước khi rút tiền</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all hover:shadow-neon"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Số tiền (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50001"
                min="50001"
                max={balance}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green bg-dark-card-bright text-dark-text"
                required
              />
              <p className="text-xs text-dark-text2 mt-1">
                Phải lớn hơn 50,000 VNĐ. Số dư khả dụng: {new Intl.NumberFormat("vi-VN").format(balance)} đ
              </p>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Tài khoản ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green bg-dark-card-bright text-dark-text"
                required
              >
                <option value="">Chọn tài khoản</option>
                {bankAccounts.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.bankName} - {bank.accountNumber} {bank.isDefault && "(Mặc định)"}
                  </option>
                ))}
              </select>
            </div>

            {selectedBank && (
              <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
                {(() => {
                  const bank = bankAccounts.find((b) => b._id === selectedBank);
                  return bank ? (
                    <>
                      <p className="text-sm text-dark-text mb-1">
                        <strong>Ngân hàng:</strong> {bank.bankName}
                      </p>
                      <p className="text-sm text-dark-text mb-1">
                        <strong>STK:</strong> {bank.accountNumber}
                      </p>
                      <p className="text-sm text-dark-text mb-1">
                        <strong>Chủ TK:</strong> {bank.accountHolder}
                      </p>
                      {bank.branch && (
                        <p className="text-sm text-dark-text">
                          <strong>Chi nhánh:</strong> {bank.branch}
                        </p>
                      )}
                    </>
                  ) : null;
                })()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 flex-shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-neon"
              >
                <ArrowDown className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold whitespace-nowrap">{loading ? "Đang xử lý..." : "Gửi yêu cầu rút tiền"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-dark-border text-dark-text2 rounded-xl font-semibold text-sm sm:text-base hover:bg-dark-border hover:text-neon-green transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

