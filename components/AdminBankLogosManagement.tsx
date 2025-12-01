"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, X, Save, Pin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BANKS } from "@/lib/banks";

interface BankLogo {
  _id: string;
  bankName: string;
  shortName: string;
  code: string;
  logo: string;
  isActive: boolean;
  displayOrder: number;
}

interface AdminBankLogosManagementProps {
  initialBankLogos: BankLogo[];
}

export function AdminBankLogosManagement({ initialBankLogos }: AdminBankLogosManagementProps) {
  const router = useRouter();
  const [bankLogos, setBankLogos] = useState<BankLogo[]>(initialBankLogos);
  const [showForm, setShowForm] = useState(false);
  const [editingLogo, setEditingLogo] = useState<BankLogo | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BankLogo>>({
    bankName: "",
    shortName: "",
    code: "",
    logo: "",
    isActive: true,
    displayOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingLogo
        ? `/api/admin/bank-logos/${editingLogo._id}`
        : "/api/admin/bank-logos";
      const method = editingLogo ? "PUT" : "POST";

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
      toast.success(editingLogo ? "Cập nhật thành công!" : "Thêm thành công!");
      
      router.refresh();
      setShowForm(false);
      setEditingLogo(null);
      setFormData({
        bankName: "",
        shortName: "",
        code: "",
        logo: "",
        isActive: true,
        displayOrder: 0,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (logo: BankLogo) => {
    setEditingLogo(logo);
    setFormData({
      bankName: logo.bankName,
      shortName: logo.shortName,
      code: logo.code,
      logo: logo.logo,
      isActive: logo.isActive,
      displayOrder: logo.displayOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa logo này?")) return;

    try {
      const res = await fetch(`/api/admin/bank-logos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Có lỗi xảy ra");
      }

      toast.success("Đã xóa logo thành công!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBankSelect = (bankName: string) => {
    const bank = BANKS.find((b) => b.name === bankName);
    if (bank) {
      setFormData({
        ...formData,
        bankName: bank.name,
        shortName: bank.shortName,
        code: bank.code,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-dark-text">
              {editingLogo ? "Chỉnh sửa logo ngân hàng" : "Thêm logo ngân hàng"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingLogo(null);
                setFormData({
                  bankName: "",
                  shortName: "",
                  code: "",
                  logo: "",
                  isActive: true,
                  displayOrder: 0,
                });
              }}
              className="text-dark-text2 hover:text-dark-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-2 text-sm text-dark-text2">
              <Pin className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-dark-text">Lưu ý:</strong> Logo này sẽ hiển thị trong dropdown "Chọn ngân hàng" của user khi họ thêm tài khoản ngân hàng của mình.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                Chọn ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bankName || ""}
                onChange={(e) => handleBankSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all bg-dark-card-bright text-dark-text"
                required
                disabled={!!editingLogo}
              >
                <option value="">Chọn ngân hàng</option>
                {BANKS.map((bank) => (
                  <option key={bank.name} value={bank.name}>
                    {bank.name} ({bank.shortName})
                  </option>
                ))}
              </select>
              {formData.bankName && (
                <p className="text-xs text-dark-text2 mt-1">
                  Mã: {formData.code} | Tên viết tắt: {formData.shortName}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div className="bg-neon-green/10 p-4 rounded-xl border-2 border-neon-green/30">
              <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                🖼️ Logo ngân hàng <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-dark-text2 mb-3">
                Upload logo để hiển thị trong dropdown "Chọn ngân hàng" của user
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

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-heading font-bold text-dark-text mb-2">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={formData.displayOrder || 0}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-neon-green rounded"
                />
                <label htmlFor="isActive" className="text-sm text-dark-text">
                  Hiển thị
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-6 py-3 rounded-xl font-heading font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-neon"
              >
                <Save className="w-4 h-4" />
                {loading ? "Đang lưu..." : editingLogo ? "Cập nhật" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLogo(null);
                  setFormData({
                    bankName: "",
                    shortName: "",
                    code: "",
                    logo: "",
                    isActive: true,
                    displayOrder: 0,
                  });
                }}
                className="px-6 py-3 border-2 border-dark-border text-dark-text2 rounded-xl font-medium hover:bg-dark-border hover:text-neon-green transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-dark-text">
            Danh sách logo ngân hàng ({bankLogos.length})
          </h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-neon-green hover:bg-neon-green-light text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Thêm logo mới
            </button>
          )}
        </div>

        {bankLogos.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-dark-text2/30 mx-auto mb-4" />
            <p className="text-dark-text2 mb-4">Chưa có logo ngân hàng nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-neon-green hover:bg-neon-green-light text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm logo đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {bankLogos.map((logo) => (
              <div
                key={logo._id}
                className={`p-6 hover:bg-dark-bg transition-colors ${
                  !logo.isActive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 rounded-xl bg-dark-bg border-2 border-dark-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {logo.logo ? (
                        <Image
                          src={logo.logo}
                          alt={logo.bankName}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-dark-text2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-heading font-bold text-dark-text">{logo.bankName}</h4>
                        {!logo.isActive && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                            Đã ẩn
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-text2">
                        {logo.shortName} ({logo.code}) • Thứ tự: {logo.displayOrder}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(logo)}
                      className="p-2 text-dark-text2 hover:text-neon-green hover:bg-neon-green/10 rounded-xl transition-colors"
                      title="Sửa"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(logo._id)}
                      className="p-2 text-dark-text2 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                      title="Xóa"
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

