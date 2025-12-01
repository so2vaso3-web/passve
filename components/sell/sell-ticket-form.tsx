"use client";

import { useState } from "react";
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

const ticketSchema = z.object({
  movieTitle: z.string().min(1, "Vui lòng nhập tên phim/sự kiện"),
  cinema: z.string().min(1, "Vui lòng nhập tên rạp"),
  city: z.string().min(1, "Vui lòng chọn thành phố"),
  showDate: z.string().min(1, "Vui lòng chọn ngày chiếu"),
  showTime: z.string().min(1, "Vui lòng nhập giờ chiếu"),
  seats: z.string().min(1, "Vui lòng nhập số ghế (VD: A1, A2)"),
  originalPrice: z.number().min(1, "Vui lòng nhập giá gốc"),
  sellingPrice: z.number().min(1, "Vui lòng nhập giá bán"),
  category: z.enum(["movie", "concert", "event"]),
  description: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function SellTicketForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [movieResults, setMovieResults] = useState<TMDBMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: "movie",
    },
  });

  const category = watch("category");

  if (!session) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-dark-600 dark:text-dark-400 mb-4">
            Vui lòng đăng nhập để đăng bán vé
          </p>
          <Button onClick={() => router.push("/api/auth/signin")}>
            Đăng nhập
          </Button>
        </div>
      </Card>
    );
  }

  const handleMovieSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setMovieResults([]);
      return;
    }

    if (category === "movie") {
      const results = await searchMovies(query);
      setMovieResults(results);
    }
  };

  const handleSelectMovie = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setValue("movieTitle", movie.title);
    setSearchQuery(movie.title);
    setMovieResults([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.urls) {
        setImages([...images, ...data.urls]);
        toast.success("Upload ảnh thành công");
      }
    } catch (error) {
      toast.error("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: TicketFormData) => {
    if (images.length === 0) {
      toast.error("Vui lòng upload ít nhất 1 ảnh vé");
      return;
    }

    try {
      const seats = data.seats.split(",").map((s) => s.trim());

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          seats,
          images,
          movieId: selectedMovie?.id || undefined,
          moviePoster: selectedMovie ? getPosterUrl(selectedMovie.poster_path) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Đăng tin thành công! Đang chờ duyệt...");
        router.push("/profile");
      } else {
        toast.error("Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Loại vé
          </label>
          <div className="flex gap-4">
            {(["movie", "concert", "event"] as const).map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={cat}
                  {...register("category")}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-dark-700 dark:text-dark-300">
                  {cat === "movie" ? "Phim" : cat === "concert" ? "Concert" : "Sự kiện"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Movie Search (only for movies) */}
        {category === "movie" && (
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Tìm phim (TMDb)
            </label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => handleMovieSearch(e.target.value)}
                placeholder="Nhập tên phim..."
              />
              {movieResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {movieResults.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSelectMovie(movie)}
                      className="w-full p-3 hover:bg-dark-100 dark:hover:bg-dark-700 flex items-center gap-3 text-left"
                    >
                      {movie.poster_path && (
                        <img
                          src={getPosterUrl(movie.poster_path, "w92")}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-dark-900 dark:text-dark-100">
                          {movie.title}
                        </p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movie Title */}
        <Input
          label="Tên phim/sự kiện"
          {...register("movieTitle")}
          error={errors.movieTitle?.message}
          placeholder="VD: Quỷ Ăn Tạng 3"
        />

        {/* Cinema */}
        <Input
          label="Tên rạp"
          {...register("cinema")}
          error={errors.cinema?.message}
          placeholder="VD: CGV Vincom Center"
        />

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Thành phố
          </label>
          <select
            {...register("city")}
            className="w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100"
          >
            <option value="">Chọn thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Huế">Huế</option>
            <option value="Vũng Tàu">Vũng Tàu</option>
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
        </div>

        {/* Show Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ngày chiếu"
            type="date"
            {...register("showDate")}
            error={errors.showDate?.message}
          />
          <Input
            label="Giờ chiếu"
            type="time"
            {...register("showTime")}
            error={errors.showTime?.message}
          />
        </div>

        {/* Seats */}
        <Input
          label="Số ghế (phân cách bằng dấu phẩy)"
          {...register("seats")}
          error={errors.seats?.message}
          placeholder="VD: A1, A2, A3"
        />

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá gốc (VNĐ)"
            type="number"
            {...register("originalPrice", { valueAsNumber: true })}
            error={errors.originalPrice?.message}
          />
          <Input
            label="Giá bán lại (VNĐ)"
            type="number"
            {...register("sellingPrice", { valueAsNumber: true })}
            error={errors.sellingPrice?.message}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Ảnh vé (tối đa 5 ảnh)
          </label>
          <div className="grid grid-cols-5 gap-4 mb-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-dark-200 dark:border-dark-700">
                <Image src={url} alt={`Vé ${index + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="animate-spin text-primary-500">⏳</div>
                ) : (
                  <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Mô tả (tùy chọn)
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100"
            placeholder="Thêm thông tin về vé..."
          />
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          Đăng bán vé
        </Button>
      </form>
    </Card>
  );
}

