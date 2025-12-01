"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { BackButton } from "./BackButton";
import { Upload, X, Loader2, Calendar, Clock, MapPin, Ticket, DollarSign, Image as ImageIcon } from "lucide-react";

interface PostFormData {
  category: "movie" | "concert" | "event";
  title: string; // Tên phim/sự kiện tự nhập
  showDate: string;
  showTime: string;
  cinema: string; // Rạp tự nhập
  city: string;
  seats: string;
  quantity: number;
  originalPrice: string;
  sellingPrice: string;
  images: string[];
  qrImage?: string; // Ảnh mã QR (ẩn, chỉ hiển thị khi khách mua)
  reason: string;
  description: string;
}

const SHOW_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00",
];

export function PostForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<PostFormData>({
    category: "movie",
    title: "",
    showDate: "",
    showTime: "",
    cinema: "",
    city: "",
    seats: "",
    quantity: 1,
    originalPrice: "",
    sellingPrice: "",
    images: [],
    qrImage: undefined,
    reason: "",
    description: "",
  });
  const [priceMode, setPriceMode] = useState<"desired" | "selling">("desired"); // desired = giá mong muốn nhận, selling = giá bán

  // Image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Ảnh ${file.name} vượt quá 5MB`);
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(`Đã upload ${uploadedUrls.length} ảnh`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: { files },
      } as any;
      handleImageSelect(fakeEvent);
    }
  };

  // QR Image upload
  const handleQRImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh QR vượt quá 5MB");
      return;
    }

    setUploadingQR(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        qrImage: data.url,
      }));

      toast.success("Đã upload ảnh mã QR");
    } catch (error: any) {
      console.error("Upload QR error:", error);
      toast.error(error.message || "Lỗi khi upload ảnh QR");
    } finally {
      setUploadingQR(false);
      if (qrFileInputRef.current) {
        qrFileInputRef.current.value = "";
      }
    }
  };

  // Calculate expire time
  const getExpireTime = () => {
    if (!formData.showDate || !formData.showTime) return null;
    const [hours, minutes] = formData.showTime.split(":").map(Number);
    const showDateTime = new Date(formData.showDate);
    showDateTime.setHours(hours, minutes, 0, 0);
    return new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.category) {
      toast.error("Vui lòng chọn loại vé");
      return false;
    }

    if (!formData.title || formData.title.trim().length === 0) {
      toast.error("Vui lòng nhập tên phim/sự kiện");
      return false;
    }

    if (!formData.showDate || !formData.showTime) {
      const timeLabel = formData.category === "movie" ? "chiếu" : formData.category === "concert" ? "diễn" : "tổ chức";
      toast.error(`Vui lòng chọn ngày và giờ ${timeLabel}`);
      return false;
    }

    if (!formData.cinema || formData.cinema.trim().length === 0) {
      toast.error(formData.category === "movie" ? "Vui lòng nhập tên rạp" : "Vui lòng nhập địa điểm");
      return false;
    }

    if (!formData.city || formData.city.trim().length === 0) {
      toast.error("Vui lòng nhập thành phố");
      return false;
    }

    if (!formData.seats.trim()) {
      const seatsLabel = formData.category === "movie" ? "số ghế" : formData.category === "concert" ? "khu vực/ghế" : "khu vực/vị trí";
      toast.error(`Vui lòng nhập ${seatsLabel}`);
      return false;
    }

    if (!formData.quantity || formData.quantity < 1) {
      toast.error("Số lượng vé phải lớn hơn 0");
      return false;
    }

    const originalPrice = parseFloat(formData.originalPrice);
    let sellingPrice = parseFloat(formData.sellingPrice);

    if (!originalPrice || originalPrice < 0) {
      toast.error("Vui lòng nhập giá gốc hợp lệ");
      return false;
    }

    // Validate selling price
    if (!sellingPrice || sellingPrice < 50000) {
      toast.error("Giá bán lại phải lớn hơn hoặc bằng 50,000 VNĐ");
      return false;
    }

    if (formData.images.length === 0) {
      toast.error("Vui lòng upload ít nhất 1 ảnh vé");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.category,
          movieTitle: formData.title,
          showDate: formData.showDate,
          showTime: formData.showTime,
          cinema: formData.cinema,
          city: formData.city,
          seats: formData.seats,
          quantity: formData.quantity,
          originalPrice: parseFloat(formData.originalPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          images: formData.images,
          qrImage: formData.qrImage,
          reason: formData.reason,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast.success("Đăng tin thành công! Vé đã hiển thị trên trang chủ", {
        duration: 4000,
      });
      
      // Redirect về trang chủ sau 1.5 giây để xem vé mới
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
      // Redirect to homepage and refresh
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Error posting ticket:", error);
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Format price for preview
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton href="/" label="Quay lại Trang chủ" />
      </div>
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
              Đăng bán vé
            </h1>
            <p className="text-dark-text2">
              Điền thông tin vé của bạn để bắt đầu bán
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-5 py-2.5 border border-dark-border text-dark-text rounded-xl font-semibold text-sm hover:bg-dark-border hover:border-neon-green transition-colors"
          >
            {previewMode ? "Chỉnh sửa" : "Xem trước tin"}
          </button>
        </div>

        {previewMode ? (
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-dark-bg border border-dark-border rounded-2xl overflow-hidden shadow-card">
              {/* Image */}
              <div className="relative w-full h-64 bg-dark-border">
                {formData.images.length > 0 ? (
                  <Image
                    src={formData.images[0]}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ticket className="w-16 h-16 text-dark-text2" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-neon-green text-white px-3 py-1 rounded-full text-xs font-bold">
                    {formData.category === "movie" ? "Vé phim" : formData.category === "concert" ? "Vé concert" : "Vé sự kiện"}
                  </span>
                </div>

                <h2 className="text-xl font-heading font-bold text-dark-text mb-4">
                  {formData.title || "Chưa có tiêu đề"}
                </h2>

                <div className="space-y-3 mb-4">
                  {formData.showDate && formData.showTime && (
                    <div className="flex items-center gap-2 text-sm text-dark-text2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(formData.showDate).toLocaleDateString("vi-VN")} • {formData.showTime}
                      </span>
                    </div>
                  )}

                  {formData.cinema && (
                    <div className="flex items-center gap-2 text-sm text-dark-text2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {formData.category === "movie" ? "Rạp: " : "Địa điểm: "}
                        {formData.cinema}{formData.city && `, ${formData.city}`}
                      </span>
                    </div>
                  )}

                  {formData.seats && (
                    <div className="flex items-center gap-2 text-sm text-dark-text2">
                      <Ticket className="w-4 h-4" />
                      <span>
                        {formData.category === "movie" ? "Ghế: " : formData.category === "concert" ? "Khu vực/Ghế: " : "Khu vực/Vị trí: "}
                        {formData.seats}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  {formData.sellingPrice && (
                    <p className="text-2xl font-heading font-black text-neon-green-light text-glow">
                      {formatPrice(formData.sellingPrice)} đ
                    </p>
                  )}
                  {formData.originalPrice && (
                    <p className="text-base text-dark-text2 line-through">
                      {formatPrice(formData.originalPrice)} đ
                    </p>
                  )}
                </div>

                {formData.description && (
                  <p className="text-dark-text2 mb-4">{formData.description}</p>
                )}

                {formData.reason && (
                  <div className="bg-dark-card border border-dark-border p-3 rounded-xl">
                    <p className="text-sm text-dark-text">
                      <strong>Lý do bán:</strong> {formData.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="w-full bg-neon-green hover:bg-neon-green-light text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-neon"
            >
              Quay lại chỉnh sửa
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loại vé */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-3">
                Loại vé <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {(["movie", "concert", "event"] as const).map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.category === cat
                        ? "border-neon-green bg-neon-green/20 text-neon-green"
                        : "border-dark-border hover:border-neon-green text-dark-text2"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={formData.category === cat}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as any })
                      }
                      className="w-4 h-4 text-neon-green"
                    />
                    <span className="font-semibold">
                      {cat === "movie" ? "Phim" : cat === "concert" ? "Concert" : "Sự kiện"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tên phim/sự kiện */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Tên {formData.category === "movie" ? "phim" : formData.category === "concert" ? "concert" : "sự kiện"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={formData.category === "movie" ? "VD: Dune 2, Avatar 2, Oppenheimer..." : formData.category === "concert" ? "VD: BlackPink Concert, Taylor Swift..." : "VD: Marathon TP.HCM, Triển lãm..."}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                required
              />
            </div>

            {/* Ngày và giờ - Khác nhau theo loại vé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                   <label className="block text-sm font-semibold text-dark-text mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formData.category === "movie" ? "Ngày chiếu" : formData.category === "concert" ? "Ngày diễn" : "Ngày tổ chức"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.showDate}
                  onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-card-bright"
                  required
                />
              </div>

              <div>
                   <label className="block text-sm font-semibold text-dark-text mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formData.category === "movie" ? "Giờ chiếu" : formData.category === "concert" ? "Giờ diễn" : "Giờ bắt đầu"} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.showTime}
                  onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
                  className="w-full px-4 py-3 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-bg font-medium"
                  required
                >
                  <option value="">{formData.category === "movie" ? "Chọn giờ chiếu" : formData.category === "concert" ? "Chọn giờ diễn" : "Chọn giờ bắt đầu"}</option>
                  {SHOW_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Địa điểm/Rạp - Khác nhau theo loại vé */}
            {formData.category === "movie" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Tên rạp chiếu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cinema}
                    onChange={(e) => setFormData({ ...formData, cinema: e.target.value })}
                    placeholder="VD: CGV Vincom, Lotte Cinema, Galaxy Cinema..."
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                </div>

                <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                    Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Địa điểm {formData.category === "concert" ? "diễn" : "tổ chức"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cinema}
                    onChange={(e) => setFormData({ ...formData, cinema: e.target.value })}
                    placeholder={formData.category === "concert" ? "VD: Sân vận động Mỹ Đình, Nhà thi đấu Quân khu 7..." : "VD: Phố đi bộ Nguyễn Huệ, Công viên Lê Văn Tám..."}
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                </div>

                <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                    Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                </div>
              </div>
            )}

            {/* Số ghế/Khu vực - Khác nhau theo loại vé */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                <Ticket className="w-4 h-4 inline mr-1" />
                {formData.category === "movie" ? "Số ghế cụ thể" : formData.category === "concert" ? "Khu vực/Ghế" : "Khu vực/Vị trí"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                placeholder={formData.category === "movie" ? "VD: G12, G13 hoặc VIP 05" : formData.category === "concert" ? "VD: Khu vực Standing, Hàng A Ghế 10, VIP 01-05" : "VD: Khu vực VIP, Cổng A, Vị trí số 15"}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                required
              />
              <p className="text-xs text-dark-text2 mt-1">
                {formData.category === "movie" 
                  ? "Nhập số ghế cụ thể, ví dụ: A12, B13, VIP 05, hoặc G12 G13"
                  : formData.category === "concert"
                  ? "Nhập khu vực và số ghế, ví dụ: Standing, Hàng A Ghế 10, VIP 01-05"
                  : "Nhập khu vực hoặc vị trí, ví dụ: Khu vực VIP, Cổng A, Vị trí số 15"}
              </p>
            </div>

            {/* Số lượng vé */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Số lượng vé <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                min="1"
                className="w-full px-4 py-3 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text bg-dark-bg"
                required
              />
            </div>

            {/* Giá gốc và Giá bán lại */}
            <div className="space-y-6">
              {/* Price Mode Toggle */}
              <div className="flex items-center gap-4 p-3 bg-dark-bg rounded-xl border border-dark-border">
                <span className="text-sm font-semibold text-dark-text">Cách nhập giá:</span>
                <button
                  type="button"
                  onClick={() => setPriceMode("desired")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    priceMode === "desired"
                      ? "bg-neon-green text-white"
                      : "bg-dark-card text-dark-text2 hover:bg-dark-border"
                  }`}
                >
                  Giá mong muốn nhận về
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode("selling")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    priceMode === "selling"
                      ? "bg-neon-green text-white"
                      : "bg-dark-card text-dark-text2 hover:bg-dark-border"
                  }`}
                >
                  Giá bán cho khách
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Giá gốc (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="500000"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {priceMode === "desired" ? "Giá mong muốn nhận về (VNĐ)" : "Giá bán cho khách (VNĐ)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, sellingPrice: value });
                    }}
                    placeholder={priceMode === "desired" ? "1000000" : "1075000"}
                    min="50000"
                    className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                    required
                  />
                  {priceMode === "desired" && formData.sellingPrice && formData.originalPrice && (
                    <div className="mt-2 p-3 bg-dark-bg border border-dark-border rounded-lg">
                      <p className="text-xs text-dark-text2 mb-1">Hệ thống sẽ tự tính:</p>
                      <p className="text-sm text-dark-text font-semibold">
                        Giá bán cho khách: <span className="text-neon-green">{formatPrice((parseFloat(formData.sellingPrice) / 0.93).toString())} đ</span>
                      </p>
                      <p className="text-xs text-dark-text2 mt-1">
                        Bạn sẽ nhận về: <span className="text-dark-text font-semibold">{formatPrice(formData.sellingPrice)} đ</span> (sau phí 7%)
                      </p>
                    </div>
                  )}
                  {priceMode === "selling" && formData.sellingPrice && (
                    <div className="mt-2 p-3 bg-dark-bg border border-dark-border rounded-lg">
                      <p className="text-xs text-dark-text2 mb-1">Sau phí nền tảng 7%:</p>
                      <p className="text-sm text-dark-text font-semibold">
                        Bạn sẽ nhận về: <span className="text-neon-green">{formatPrice((parseFloat(formData.sellingPrice) * 0.93).toString())} đ</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-dark-text2 mt-1">Tối thiểu 50,000 VNĐ</p>
                </div>
              </div>
            </div>

            {/* Upload ảnh */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Hình ảnh{" "}
                {formData.images.length > 0 && (
                  <span className="text-primary">({formData.images.length}/5)</span>
                )}{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-dark-text2 mb-3">
                💡 Nên tải ảnh thông tin vé (mặt trước, mặt sau, thông tin ghế, v.v.)
              </p>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dark-border">
                        <Image
                          src={url}
                          alt={`Upload ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-button"
                        aria-label="Xóa ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length < 5 && (
                <label
                  htmlFor="image-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    uploading
                      ? "border-neon-green bg-neon-green/20"
                      : "border-dark-border hover:border-neon-green hover:bg-neon-green/10"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-primary mb-4 animate-spin" />
                      <p className="text-primary font-medium">Đang upload...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-dark-text2 mx-auto mb-4" />
                      <p className="text-dark-text2 mb-2 font-medium">
                        Kéo thả ảnh vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm text-dark-text2">
                        Tối đa 5 ảnh, mỗi ảnh tối đa 5MB
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={handleImageSelect}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Upload ảnh QR */}
            <div className="bg-dark-bg border border-dark-border rounded-xl p-4">
              <label className="block text-sm font-semibold text-dark-text mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Ảnh mã QR <span className="text-dark-text2 text-xs font-normal">(tùy chọn)</span>
              </label>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                <p className="text-xs text-yellow-400 font-medium mb-1">
                  ⚠️ Lưu ý quan trọng:
                </p>
                <ul className="text-xs text-yellow-300/80 space-y-1 list-disc list-inside">
                  <li>Ảnh mã QR sẽ được <strong>ẩn hoàn toàn</strong> trên bài đăng công khai</li>
                  <li>Chỉ hiển thị cho <strong>người mua sau khi họ đã thanh toán</strong></li>
                  <li>Chụp màn hình hoặc forward tin nhắn/email chứa mã QR</li>
                </ul>
              </div>
              <div className="flex items-start gap-3">
                {formData.qrImage ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-neon-green/30 bg-dark-card flex-shrink-0">
                    <Image
                      src={formData.qrImage}
                      alt="Mã QR"
                      fill
                      className="object-contain p-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, qrImage: undefined })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Xóa ảnh QR"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-card flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-dark-text2" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="qr-image-upload"
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                      uploadingQR
                        ? "bg-dark-border text-dark-text2 cursor-not-allowed"
                        : "bg-neon-green hover:bg-neon-green-light text-white hover:shadow-neon-sm"
                    }`}
                  >
                    {uploadingQR ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang upload...</span>
                      </div>
                    ) : formData.qrImage ? (
                      "Thay đổi ảnh QR"
                    ) : (
                      "Tải lên ảnh mã QR"
                    )}
                  </label>
                  <input
                    ref={qrFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="qr-image-upload"
                    onChange={handleQRImageSelect}
                    disabled={uploadingQR}
                  />
                  {formData.qrImage && (
                    <p className="mt-2 text-xs text-neon-green">
                      ✓ Đã tải lên ảnh mã QR
                    </p>
                  )}
                  <p className="text-xs text-dark-text2 mt-2">
                    Tối đa 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Lý do bán */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Lý do bán
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="VD: Bận việc đột xuất, không đi được..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 resize-none font-medium bg-dark-card-bright"
              />
            </div>

            {/* Mô tả thêm */}
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                Mô tả thêm (tùy chọn)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Thông tin bổ sung về vé..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-dark-text placeholder:text-dark-text2 resize-none font-medium bg-dark-card-bright"
              />
            </div>

            {/* Thông tin hết hạn */}
            {formData.showDate && formData.showTime && (
              <div className="bg-dark-card border border-dark-border p-4 rounded-xl">
                <p className="text-sm text-dark-text">
                  <strong>Tin sẽ tự động hết hạn sau:</strong>{" "}
                  {getExpireTime()?.toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-dark-text2 mt-1">
                  (Sau {formData.category === "movie" ? "giờ chiếu" : formData.category === "concert" ? "giờ diễn" : "giờ bắt đầu"} + 3 tiếng)
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-7 py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-neon"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang đăng...</span>
                  </>
                ) : (
                  <span>Đăng tin</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-7 py-3 border border-dark-border text-dark-text2 rounded-xl font-semibold hover:bg-dark-border hover:text-neon-green transition-all"
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
