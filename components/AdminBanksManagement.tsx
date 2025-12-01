"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Building2, CheckCircle, X, Pin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BankIcon } from "./BankIcon";

interface AdminBank {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCode?: string;
  logo?: string;
  type: "bank";
  isActive: boolean;
  displayOrder: number;
}

interface AdminBanksManagementProps {
  initialBanks: AdminBank[];
}

export function AdminBanksManagement({ initialBanks }: AdminBanksManagementProps) {
  const router = useRouter();
  const [banks, setBanks] = useState<AdminBank[]>(initialBanks);
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState<AdminBank | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminBank>>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    qrCode: "",
    logo: "",
    type: "bank",
    isActive: true,
    displayOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBank
        ? `/api/admin/banks/${editingBank._id}`
        : "/api/admin/banks";
      const method = editingBank ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Có lỗi xảy ra");
      }

      const data = await res.json();
      toast.success(editingBank ? "Cập nhật thành công!" : "Thêm thành công!");
      
      router.refresh();
      setShowForm(false);
      setEditingBank(null);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        qrCode: "",
        logo: "",
        type: "bank",
        isActive: true,
        displayOrder: 0,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank: AdminBank) => {
    setEditingBank(bank);
      setFormData({
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        qrCode: bank.qrCode || "",
        logo: bank.logo || "",
        type: bank.type,
        isActive: bank.isActive,
        displayOrder: bank.displayOrder,
      });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Có lỗi xảy ra");
      }

      toast.success("Xóa thành công!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return <Building2 className="w-5 h-5 text-dark-text2" />;
  };

  const getTypeLabel = (type: string) => {
    return "Ngân hàng";
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-dark-text">
              {editingBank ? "Chỉnh sửa tài khoản nhận tiền" : "Thêm tài khoản nhận tiền"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingBank(null);
                setFormData({
                  bankName: "",
                  accountNumber: "",
                  accountHolder: "",
                  qrCode: "",
                  logo: "",
                  type: "bank",
                  isActive: true,
                  displayOrder: 0,
                });
              }}
              className="text-dark-text2 hover:text-dark-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl">
            <div className="flex items-start gap-2 text-sm text-dark-text2">
              <Pin className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-dark-text">Lưu ý:</strong> Đây là tài khoản ngân hàng/ví điện tử của <strong className="text-neon-green">HỆ THỐNG</strong> (không phải của user). 
                Bao gồm: <strong>Số tài khoản</strong>, <strong>Chủ tài khoản</strong>, <strong>QR code</strong> (nếu có), và <strong>Logo ngân hàng</strong> để hiển thị trong form nạp tiền.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Loại tài khoản <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all bg-dark-card-bright text-dark-text"
                required
                disabled
              >
                <option value="bank">Ngân hàng</option>
              </select>
              <p className="text-xs text-dark-text2 mt-1">Chỉ hỗ trợ thanh toán qua ngân hàng</p>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Tên ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright font-medium"
                required
              >
                <option value="">Chọn ngân hàng</option>
                <option value="Vietcombank">Vietcombank</option>
                <option value="Vietinbank">Vietinbank</option>
                <option value="BIDV">BIDV</option>
                <option value="Agribank">Agribank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MBBank">MBBank</option>
                <option value="VPBank">VPBank</option>
                <option value="ACB">ACB</option>
                <option value="TPBank">TPBank</option>
                <option value="HDBank">HDBank</option>
                <option value="Sacombank">Sacombank</option>
                <option value="Eximbank">Eximbank</option>
                <option value="MSB">MSB</option>
                <option value="VIB">VIB</option>
                <option value="SHB">SHB</option>
                <option value="OCB">OCB</option>
                <option value="VietABank">VietABank</option>
                <option value="NamABank">NamABank</option>
                <option value="PGBank">PGBank</option>
                <option value="ABBank">ABBank</option>
                <option value="BacABank">BacABank</option>
                <option value="SeABank">SeABank</option>
                <option value="Kienlongbank">Kienlongbank</option>
                <option value="PVcomBank">PVcomBank</option>
                <option value="PublicBank">PublicBank</option>
                <option value="Hong Leong Bank">Hong Leong Bank</option>
                <option value="Standard Chartered">Standard Chartered</option>
                <option value="HSBC">HSBC</option>
                <option value="ANZ">ANZ</option>
                <option value="Woori Bank">Woori Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="VD: 1234567890"
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="VD: PASS VE PHIM"
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                required
              />
            </div>

            {/* Logo tài khoản nhận tiền (để hiển thị trong form nạp tiền) */}
            <div className="bg-blue-500/10 p-4 rounded-xl border-2 border-blue-500/30">
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                🖼️ Logo tài khoản nhận tiền <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-dark-text2 mb-3">
                <strong className="text-dark-text">Lưu ý:</strong> Logo này để hiển thị trong form nạp tiền khi khách chọn tài khoản này. 
                <br />Logo ngân hàng cho dropdown "Chọn ngân hàng" của user được quản lý ở mục <strong className="text-neon-green">"Quản lý logo ngân hàng"</strong> riêng.
              </p>
              <div className="space-y-3">
                {/* Input URL */}
                <div>
                  <label className="block text-xs text-dark-text2 mb-1 font-medium">Hoặc nhập URL ảnh:</label>
                  <input
                    type="url"
                    value={formData.logo || ""}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                  />
                </div>
                
                {/* Upload File */}
                <div>
                  <label className="block text-xs text-dark-text2 mb-1 font-medium">Hoặc upload file ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Ảnh không được vượt quá 5MB");
                        return;
                      }

                      const uploadFormData = new FormData();
                      uploadFormData.append("file", file);

                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadFormData,
                        });

                        if (!res.ok) throw new Error("Upload failed");

                        const data = await res.json();
                        setFormData((prev) => ({ ...prev, logo: data.url }));
                        toast.success("Đã upload logo thành công");
                      } catch (error: any) {
                        toast.error(error.message || "Lỗi khi upload logo");
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-bg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neon-green file:text-white hover:file:bg-neon-green-light cursor-pointer"
                  />
                </div>
                
                {/* Preview Logo */}
                {formData.logo && (
                  <div className="mt-3 p-3 bg-dark-bg rounded-xl border-2 border-dark-border">
                    <p className="text-xs text-dark-text2 mb-2 font-medium">Preview logo:</p>
                    <div className="relative w-32 h-32 border-2 border-dark-border rounded-xl overflow-hidden bg-dark-card flex items-center justify-center">
                      <Image src={formData.logo} alt="Logo preview" fill className="object-contain p-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-neon-green rounded border-dark-border focus:ring-neon-green bg-dark-bg"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-dark-text">
                Kích hoạt
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-7 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon"
              >
                {loading ? "Đang xử lý..." : editingBank ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBank(null);
                  setFormData({
                    bankName: "",
                    accountNumber: "",
                    accountHolder: "",
                    qrCode: "",
                    logo: "",
                    type: "bank",
                    isActive: true,
                    displayOrder: 0,
                  });
                }}
                className="px-7 py-3 border-2 border-dark-border text-dark-text2 rounded-xl font-medium hover:bg-dark-border hover:text-neon-green transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-7 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all hover:shadow-neon"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản mới
        </button>
      )}

      {/* Banks List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-xl font-heading font-bold text-dark-text">
            Danh sách tài khoản ({banks.length})
          </h3>
        </div>

        {banks.length === 0 ? (
          <div className="p-12 text-center text-dark-text2">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-dark-text2" />
            <p>Chưa có tài khoản nào</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {banks.map((bank) => (
              <div
                key={bank._id}
                className={`p-6 hover:bg-dark-bg transition-colors ${
                  !bank.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center flex-shrink-0">
                      <BankIcon bankName={bank.bankName} size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading font-bold text-dark-text">{bank.bankName}</h4>
                        <span className="px-2 py-1 bg-dark-bg text-dark-text2 text-xs rounded-full border border-dark-border">
                          {getTypeLabel(bank.type)}
                        </span>
                        {!bank.isActive && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                            Tạm khóa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-text mb-1">
                        <strong>Số TK:</strong> {bank.accountNumber}
                      </p>
                      <p className="text-sm text-dark-text">
                        <strong>Chủ TK:</strong> {bank.accountHolder}
                      </p>
                      {bank.qrCode && (
                        <div className="mt-3">
                          <p className="text-xs text-dark-text2 mb-2">QR Code:</p>
                          <div className="relative w-32 h-32 border border-dark-border rounded-xl overflow-hidden bg-dark-bg">
                            <Image
                              src={bank.qrCode}
                              alt="QR Code"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(bank)}
                      className="p-2 text-neon-green hover:bg-neon-green/20 rounded-xl transition-colors"
                      disabled={loading}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Building2, CheckCircle, X, Pin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BankIcon } from "./BankIcon";

interface AdminBank {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrCode?: string;
  logo?: string;
  type: "bank";
  isActive: boolean;
  displayOrder: number;
}

interface AdminBanksManagementProps {
  initialBanks: AdminBank[];
}

export function AdminBanksManagement({ initialBanks }: AdminBanksManagementProps) {
  const router = useRouter();
  const [banks, setBanks] = useState<AdminBank[]>(initialBanks);
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState<AdminBank | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminBank>>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    qrCode: "",
    logo: "",
    type: "bank",
    isActive: true,
    displayOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBank
        ? `/api/admin/banks/${editingBank._id}`
        : "/api/admin/banks";
      const method = editingBank ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Có lỗi xảy ra");
      }

      const data = await res.json();
      toast.success(editingBank ? "Cập nhật thành công!" : "Thêm thành công!");
      
      router.refresh();
      setShowForm(false);
      setEditingBank(null);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        qrCode: "",
        logo: "",
        type: "bank",
        isActive: true,
        displayOrder: 0,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank: AdminBank) => {
    setEditingBank(bank);
      setFormData({
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        qrCode: bank.qrCode || "",
        logo: bank.logo || "",
        type: bank.type,
        isActive: bank.isActive,
        displayOrder: bank.displayOrder,
      });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Có lỗi xảy ra");
      }

      toast.success("Xóa thành công!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return <Building2 className="w-5 h-5 text-dark-text2" />;
  };

  const getTypeLabel = (type: string) => {
    return "Ngân hàng";
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-dark-text">
              {editingBank ? "Chỉnh sửa tài khoản nhận tiền" : "Thêm tài khoản nhận tiền"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingBank(null);
                setFormData({
                  bankName: "",
                  accountNumber: "",
                  accountHolder: "",
                  qrCode: "",
                  logo: "",
                  type: "bank",
                  isActive: true,
                  displayOrder: 0,
                });
              }}
              className="text-dark-text2 hover:text-dark-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl">
            <div className="flex items-start gap-2 text-sm text-dark-text2">
              <Pin className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-dark-text">Lưu ý:</strong> Đây là tài khoản ngân hàng/ví điện tử của <strong className="text-neon-green">HỆ THỐNG</strong> (không phải của user). 
                Bao gồm: <strong>Số tài khoản</strong>, <strong>Chủ tài khoản</strong>, <strong>QR code</strong> (nếu có), và <strong>Logo ngân hàng</strong> để hiển thị trong form nạp tiền.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Loại tài khoản <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all bg-dark-card-bright text-dark-text"
                required
                disabled
              >
                <option value="bank">Ngân hàng</option>
              </select>
              <p className="text-xs text-dark-text2 mt-1">Chỉ hỗ trợ thanh toán qua ngân hàng</p>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Tên ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright font-medium"
                required
              >
                <option value="">Chọn ngân hàng</option>
                <option value="Vietcombank">Vietcombank</option>
                <option value="Vietinbank">Vietinbank</option>
                <option value="BIDV">BIDV</option>
                <option value="Agribank">Agribank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MBBank">MBBank</option>
                <option value="VPBank">VPBank</option>
                <option value="ACB">ACB</option>
                <option value="TPBank">TPBank</option>
                <option value="HDBank">HDBank</option>
                <option value="Sacombank">Sacombank</option>
                <option value="Eximbank">Eximbank</option>
                <option value="MSB">MSB</option>
                <option value="VIB">VIB</option>
                <option value="SHB">SHB</option>
                <option value="OCB">OCB</option>
                <option value="VietABank">VietABank</option>
                <option value="NamABank">NamABank</option>
                <option value="PGBank">PGBank</option>
                <option value="ABBank">ABBank</option>
                <option value="BacABank">BacABank</option>
                <option value="SeABank">SeABank</option>
                <option value="Kienlongbank">Kienlongbank</option>
                <option value="PVcomBank">PVcomBank</option>
                <option value="PublicBank">PublicBank</option>
                <option value="Hong Leong Bank">Hong Leong Bank</option>
                <option value="Standard Chartered">Standard Chartered</option>
                <option value="HSBC">HSBC</option>
                <option value="ANZ">ANZ</option>
                <option value="Woori Bank">Woori Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="VD: 1234567890"
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="VD: PASS VE PHIM"
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                required
              />
            </div>

            {/* Logo tài khoản nhận tiền (để hiển thị trong form nạp tiền) */}
            <div className="bg-blue-500/10 p-4 rounded-xl border-2 border-blue-500/30">
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                🖼️ Logo tài khoản nhận tiền <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-dark-text2 mb-3">
                <strong className="text-dark-text">Lưu ý:</strong> Logo này để hiển thị trong form nạp tiền khi khách chọn tài khoản này. 
                <br />Logo ngân hàng cho dropdown "Chọn ngân hàng" của user được quản lý ở mục <strong className="text-neon-green">"Quản lý logo ngân hàng"</strong> riêng.
              </p>
              <div className="space-y-3">
                {/* Input URL */}
                <div>
                  <label className="block text-xs text-dark-text2 mb-1 font-medium">Hoặc nhập URL ảnh:</label>
                  <input
                    type="url"
                    value={formData.logo || ""}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 bg-dark-card-bright"
                  />
                </div>
                
                {/* Upload File */}
                <div>
                  <label className="block text-xs text-dark-text2 mb-1 font-medium">Hoặc upload file ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Ảnh không được vượt quá 5MB");
                        return;
                      }

                      const uploadFormData = new FormData();
                      uploadFormData.append("file", file);

                      try {
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadFormData,
                        });

                        if (!res.ok) throw new Error("Upload failed");

                        const data = await res.json();
                        setFormData((prev) => ({ ...prev, logo: data.url }));
                        toast.success("Đã upload logo thành công");
                      } catch (error: any) {
                        toast.error(error.message || "Lỗi khi upload logo");
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-bg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neon-green file:text-white hover:file:bg-neon-green-light cursor-pointer"
                  />
                </div>
                
                {/* Preview Logo */}
                {formData.logo && (
                  <div className="mt-3 p-3 bg-dark-bg rounded-xl border-2 border-dark-border">
                    <p className="text-xs text-dark-text2 mb-2 font-medium">Preview logo:</p>
                    <div className="relative w-32 h-32 border-2 border-dark-border rounded-xl overflow-hidden bg-dark-card flex items-center justify-center">
                      <Image src={formData.logo} alt="Logo preview" fill className="object-contain p-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-neon-green rounded border-dark-border focus:ring-neon-green bg-dark-bg"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-dark-text">
                Kích hoạt
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-7 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon"
              >
                {loading ? "Đang xử lý..." : editingBank ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBank(null);
                  setFormData({
                    bankName: "",
                    accountNumber: "",
                    accountHolder: "",
                    qrCode: "",
                    logo: "",
                    type: "bank",
                    isActive: true,
                    displayOrder: 0,
                  });
                }}
                className="px-7 py-3 border-2 border-dark-border text-dark-text2 rounded-xl font-medium hover:bg-dark-border hover:text-neon-green transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-7 py-3 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold transition-all hover:shadow-neon"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản mới
        </button>
      )}

      {/* Banks List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-xl font-heading font-bold text-dark-text">
            Danh sách tài khoản ({banks.length})
          </h3>
        </div>

        {banks.length === 0 ? (
          <div className="p-12 text-center text-dark-text2">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-dark-text2" />
            <p>Chưa có tài khoản nào</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {banks.map((bank) => (
              <div
                key={bank._id}
                className={`p-6 hover:bg-dark-bg transition-colors ${
                  !bank.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center flex-shrink-0">
                      <BankIcon bankName={bank.bankName} size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading font-bold text-dark-text">{bank.bankName}</h4>
                        <span className="px-2 py-1 bg-dark-bg text-dark-text2 text-xs rounded-full border border-dark-border">
                          {getTypeLabel(bank.type)}
                        </span>
                        {!bank.isActive && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                            Tạm khóa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-text mb-1">
                        <strong>Số TK:</strong> {bank.accountNumber}
                      </p>
                      <p className="text-sm text-dark-text">
                        <strong>Chủ TK:</strong> {bank.accountHolder}
                      </p>
                      {bank.qrCode && (
                        <div className="mt-3">
                          <p className="text-xs text-dark-text2 mb-2">QR Code:</p>
                          <div className="relative w-32 h-32 border border-dark-border rounded-xl overflow-hidden bg-dark-bg">
                            <Image
                              src={bank.qrCode}
                              alt="QR Code"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(bank)}
                      className="p-2 text-neon-green hover:bg-neon-green/20 rounded-xl transition-colors"
                      disabled={loading}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank._id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

