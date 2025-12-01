"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { searchMovies, getPosterUrl } from "@/lib/tmdb";
import type { TMDBMovie } from "@/lib/tmdb";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  DollarSign,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

interface EditPostFormProps {
  ticketId: string;
  initialData: {
    category: string;
    movieTitle: string;
    showDate: string;
    showTime: string;
    cinema: string;
    city: string;
    seats: string;
    quantity: number;
    originalPrice: string;
    sellingPrice: string;
    images: string[];
    qrImage?: string | string[];
    reason?: string;
    description?: string;
  };
}

const formSchema = z.object({
  category: z.enum(["movie", "concert", "event"]),
  movieTitle: z.string().min(1, "Vui lòng nhập tên phim/sự kiện"),
  showDate: z.string().min(1, "Vui lòng chọn ngày chiếu"),
  showTime: z.string().min(1, "Vui lòng chọn giờ chiếu"),
  cinema: z.string().min(1, "Vui lòng chọn rạp chiếu"),
  city: z.string().min(1, "Vui lòng chọn thành phố"),
  seats: z.string().min(1, "Vui lòng nhập số ghế"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  originalPrice: z.string().min(1, "Vui lòng nhập giá gốc"),
  sellingPrice: z.string().min(1, "Vui lòng nhập giá bán"),
  images: z.array(z.string()).min(1, "Vui lòng upload ít nhất 1 ảnh"),
    qrImage: z.array(z.string()).min(1, "Vui lòng upload ít nhất 1 ảnh mã QR (bắt buộc)").max(5, "Tối đa 5 ảnh mã QR"),
  reason: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditPostForm({ ticketId, initialData }: EditPostFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [priceMode, setPriceMode] = useState<"desired" | "selling">("selling");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: initialData.category as "movie" | "concert" | "event",
      movieTitle: initialData.movieTitle,
      showDate: initialData.showDate,
      showTime: initialData.showTime,
      cinema: initialData.cinema,
      city: initialData.city,
      seats: initialData.seats,
      quantity: initialData.quantity,
      originalPrice: initialData.originalPrice,
      sellingPrice: initialData.sellingPrice,
      images: initialData.images,
      qrImage: Array.isArray(initialData.qrImage) ? initialData.qrImage : (initialData.qrImage ? [initialData.qrImage] : []),
      reason: initialData.reason,
      description: initialData.description,
    },
  });

  const formData = watch();

  useEffect(() => {
    // Set price mode based on initial data
    if (initialData.sellingPrice && initialData.originalPrice) {
      const selling = parseFloat(initialData.sellingPrice);
      const original = parseFloat(initialData.originalPrice);
      // If selling price is about 93% of original, it's likely "desired" mode
      if (Math.abs(selling / original - 0.93) < 0.1) {
        setPriceMode("desired");
      }
    }
  }, []);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "0";
    return new Intl.NumberFormat("vi-VN").format(numPrice);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setUploading(true);

    try {
      // Upload tất cả ảnh song song (parallel) thay vì tuần tự - nhanh hơn nhiều
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Ảnh ${file.name} vượt quá 5MB`);
        }

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload ${file.name} thất bại`);
        }

        const data = await res.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (uploadedUrls.length > 0) {
        setValue("images", [...formData.images, ...uploadedUrls]);
        toast.success(`Đã upload ${uploadedUrls.length} ảnh`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setValue("images", newImages);
  };

  const handleQRImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentQrImages = Array.isArray(watch("qrImage")) ? watch("qrImage") : (watch("qrImage") ? [watch("qrImage")] : []);
    
    // Kiểm tra số lượng ảnh
    if (currentQrImages.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh mã QR");
      return;
    }

    setUploadingQR(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Ảnh QR ${file.name} vượt quá 5MB`);
        }

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          return data.url;
        } else {
          throw new Error(data.error || "Upload thất bại");
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newQrImages = [...currentQrImages, ...uploadedUrls];
      setValue("qrImage", newQrImages);
      toast.success(`Đã upload ${uploadedUrls.length} ảnh QR thành công!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi upload");
    } finally {
      setUploadingQR(false);
      if (qrFileInputRef.current) {
        qrFileInputRef.current.value = "";
      }
    }
  };

  const removeQRImage = (index: number) => {
    const currentQrImages = Array.isArray(watch("qrImage")) ? watch("qrImage") : (watch("qrImage") ? [watch("qrImage")] : []);
    const newQrImages = currentQrImages.filter((_, i) => i !== index).filter((img): img is string => typeof img === 'string');
    setValue("qrImage", newQrImages.length > 0 ? newQrImages : []);
  };

  const onSubmit = async (data: FormData) => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          movieTitle: data.movieTitle,
          showDate: data.showDate,
          showTime: data.showTime,
          cinema: data.cinema,
          city: data.city,
          seats: data.seats,
          quantity: data.quantity,
          originalPrice: parseFloat(data.originalPrice),
          sellingPrice: parseFloat(data.sellingPrice),
          images: data.images,
          qrImage: Array.isArray(data.qrImage) ? data.qrImage : (data.qrImage ? [data.qrImage] : []),
          reason: data.reason,
          description: data.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Có lỗi xảy ra");
      }

      toast.success("Cập nhật bài đăng thành công!", {
        duration: 4000,
      });

      // Redirect về trang quản lý bài đăng
      setTimeout(() => {
        router.push("/profile?tab=selling");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <BackButton href="/profile?tab=selling" label="Quay lại Quản lý bài đăng" />
      </div>
      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-black text-dark-text mb-1 sm:mb-2">
              Chỉnh sửa bài đăng
            </h1>
            <p className="text-sm sm:text-base text-dark-text2">
              Cập nhật thông tin vé của bạn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Loại vé */}
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2 sm:mb-3">
              Loại vé <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {(["movie", "concert", "event"] as const).map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all text-xs sm:text-base ${
                    formData.category === cat
                      ? "border-neon-green bg-neon-green/20 text-neon-green"
                      : "border-dark-border hover:border-neon-green text-dark-text2"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("category")}
                    value={cat}
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
              {...register("movieTitle")}
              type="text"
              placeholder={formData.category === "movie" ? "VD: Dune 2, Avatar 2, Oppenheimer..." : formData.category === "concert" ? "VD: BlackPink Concert, Taylor Swift..." : "VD: Marathon TP.HCM, Triển lãm..."}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
            />
            {errors.movieTitle && (
              <p className="mt-1 text-sm text-red-500">{errors.movieTitle.message}</p>
            )}
          </div>

          {/* Ngày và giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày chiếu <span className="text-red-500">*</span>
              </label>
              <input
                {...register("showDate")}
                type="date"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text bg-dark-card-bright"
              />
              {errors.showDate && (
                <p className="mt-1 text-sm text-red-500">{errors.showDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-text mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ chiếu <span className="text-red-500">*</span>
              </label>
              <input
                {...register("showTime")}
                type="time"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text bg-dark-card-bright"
              />
              {errors.showTime && (
                <p className="mt-1 text-sm text-red-500">{errors.showTime.message}</p>
              )}
            </div>
          </div>

          {/* Địa điểm/Rạp */}
          {formData.category === "movie" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Rạp chiếu <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("cinema")}
                  type="text"
                  placeholder="VD: CGV, Lotte, Galaxy..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                />
                {errors.cinema && (
                  <p className="mt-1 text-sm text-red-500">{errors.cinema.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("city")}
                  type="text"
                  placeholder="VD: Hồ Chí Minh, Hà Nội..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text bg-dark-bg font-medium"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("cinema")}
                  type="text"
                  placeholder="VD: Sân vận động Mỹ Đình, Nhà thi đấu..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                />
                {errors.cinema && (
                  <p className="mt-1 text-sm text-red-500">{errors.cinema.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("city")}
                  type="text"
                  placeholder="VD: Hồ Chí Minh, Hà Nội..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Ghế */}
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2">
              <Ticket className="w-4 h-4 inline mr-1" />
              {formData.category === "movie" ? "Số ghế" : formData.category === "concert" ? "Khu vực/Ghế" : "Khu vực/Vị trí"} <span className="text-red-500">*</span>
            </label>
            <input
              {...register("seats")}
              type="text"
              placeholder={formData.category === "movie" ? "VD: G12, G13" : "VD: VIP A1, A2"}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
            />
            {errors.seats && (
              <p className="mt-1 text-sm text-red-500">{errors.seats.message}</p>
            )}
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2">
              Số lượng vé <span className="text-red-500">*</span>
            </label>
            <input
              {...register("quantity", { valueAsNumber: true })}
              type="number"
              min="1"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Giá */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-dark-bg rounded-xl border border-dark-border">
              <span className="text-xs sm:text-sm font-semibold text-dark-text whitespace-nowrap">Cách nhập giá:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriceMode("desired")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    priceMode === "selling"
                      ? "bg-neon-green text-white"
                      : "bg-dark-card text-dark-text2 hover:bg-dark-border"
                  }`}
                >
                  Giá bán cho khách
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Giá gốc (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("originalPrice")}
                  type="number"
                  placeholder="1000000"
                  min="0"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                />
                {errors.originalPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.originalPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {priceMode === "desired" ? "Giá mong muốn nhận về (VNĐ)" : "Giá bán cho khách (VNĐ)"} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("sellingPrice")}
                  type="number"
                  placeholder={priceMode === "desired" ? "1000000" : "1075000"}
                  min="50000"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 font-medium bg-dark-card-bright"
                />
                {errors.sellingPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.sellingPrice.message}</p>
                )}
                {priceMode === "desired" && formData.sellingPrice && formData.originalPrice && (
                  <div className="mt-2 p-3 bg-dark-bg border border-dark-border rounded-lg">
                    <p className="text-xs text-dark-text2 mb-1">Hệ thống sẽ tự tính:</p>
                    <p className="text-sm text-dark-text font-semibold">
                      Giá bán cho khách: <span className="text-neon-green">{formatPrice((parseFloat(formData.sellingPrice) / 0.93).toString())} đ</span>
                    </p>
                  </div>
                )}
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
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
              <p className="text-xs text-red-400 font-semibold mb-1">
                ⚠️ Lưu ý quan trọng:
              </p>
              <p className="text-xs text-red-300/90">
                <strong>KHÔNG NÊN</strong> tải ảnh chứa thông tin cá nhân, mã vé, hoặc thông tin nhạy cảm. Chỉ tải <strong>ảnh vé</strong> (hình ảnh vé vật lý, không có thông tin chi tiết).
              </p>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-3 sm:mb-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dark-border bg-dark-card">
                    <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formData.images.length < 5 && (
              <label
                htmlFor="image-upload"
                className={`block border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all ${
                  uploading
                    ? "border-neon-green bg-neon-green/20"
                    : "border-dark-border hover:border-neon-green hover:bg-neon-green/10"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary mb-2 sm:mb-4 animate-spin" />
                    <p className="text-xs sm:text-sm text-primary font-medium">Đang upload...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-dark-text2 mx-auto mb-2 sm:mb-4" />
                    <p className="text-xs sm:text-sm text-dark-text2 mb-1 sm:mb-2 font-medium">
                      Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-dark-text2">
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
            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* Upload ảnh QR */}
          <div className="bg-dark-bg border border-dark-border rounded-xl p-3 sm:p-4">
            <label className="block text-xs sm:text-sm font-semibold text-dark-text mb-2">
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Ảnh mã QR <span className="text-red-400 text-xs font-normal">(bắt buộc)</span>
            </label>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
              <p className="text-xs text-yellow-400 font-medium mb-1">
                ⚠️ Lưu ý quan trọng:
              </p>
              <ul className="text-xs text-yellow-300/80 space-y-0.5 sm:space-y-1 list-disc list-inside">
                <li>Ảnh mã QR sẽ được <strong>ẩn hoàn toàn</strong> trên bài đăng công khai</li>
                <li>Chỉ hiển thị cho <strong>người mua sau khi họ đã thanh toán</strong></li>
                <li>Chụp màn hình hoặc forward tin nhắn/email chứa mã QR</li>
                <li><strong>Bắt buộc phải có ít nhất 1 ảnh QR</strong></li>
              </ul>
            </div>

            {/* Hiển thị danh sách ảnh QR đã upload */}
            {formData.qrImage && Array.isArray(formData.qrImage) && formData.qrImage.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {formData.qrImage.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30 bg-dark-card">
                      <Image
                        src={url}
                        alt={`QR ${index + 1}`}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQRImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-button"
                      aria-label="Xóa ảnh QR"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {(!formData.qrImage || !Array.isArray(formData.qrImage) || formData.qrImage.length < 5) && (
              <div>
                <label
                  htmlFor="qr-image-upload"
                  className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
                    uploadingQR
                      ? "bg-dark-border text-dark-text2 cursor-not-allowed"
                      : "bg-neon-green hover:bg-neon-green-light text-white hover:shadow-neon-sm"
                  }`}
                >
                  {uploadingQR ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span>Đang upload...</span>
                    </div>
                  ) : (
                    `Tải lên ảnh mã QR ${formData.qrImage && Array.isArray(formData.qrImage) && formData.qrImage.length > 0 ? `(${formData.qrImage.length}/5)` : ""}`
                  )}
                </label>
                <input
                  ref={qrFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="qr-image-upload"
                  onChange={handleQRImageSelect}
                  disabled={uploadingQR || (formData.qrImage && Array.isArray(formData.qrImage) && formData.qrImage.length >= 5)}
                />
              </div>
            )}
            <p className="text-xs text-dark-text2 mt-2">
              Tối đa 5 ảnh, mỗi ảnh tối đa 5MB. Bắt buộc phải có ít nhất 1 ảnh.
            </p>
          </div>

          {/* Lý do bán */}
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2">
              Lý do bán <span className="text-dark-text2 text-xs font-normal">(tùy chọn)</span>
            </label>
            <textarea
              {...register("reason")}
              rows={3}
              placeholder="VD: Không thể đi được, có việc đột xuất..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 resize-none font-medium bg-dark-card-bright"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-2">
              Mô tả thêm <span className="text-dark-text2 text-xs font-normal">(tùy chọn)</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Thêm thông tin chi tiết về vé..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all text-sm sm:text-base text-dark-text placeholder:text-dark-text2 resize-none font-medium bg-dark-card-bright"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-neon-green hover:bg-neon-green-light text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-neon"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Cập nhật bài đăng</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile?tab=selling")}
              className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 border border-dark-border text-dark-text2 rounded-xl font-semibold text-sm sm:text-base hover:bg-dark-border hover:text-neon-green transition-all"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}