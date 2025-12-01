"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./Button";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface TicketFiltersProps {
  currentCategory: string;
  currentCity: string;
  currentDistrict?: string;
  cities: string[];
}

// Danh sách quận/huyện theo thành phố
const districtsByCity: Record<string, string[]> = {
  "Hà Nội": [
    "Tất cả quận/huyện",
    "Ba Đình",
    "Hoàn Kiếm",
    "Tây Hồ",
    "Long Biên",
    "Cầu Giấy",
    "Đống Đa",
    "Hai Bà Trưng",
    "Hoàng Mai",
    "Thanh Xuân",
    "Sóc Sơn",
    "Đông Anh",
    "Gia Lâm",
    "Nam Từ Liêm",
    "Bắc Từ Liêm",
    "Mê Linh",
    "Hà Đông",
    "Sơn Tây",
    "Ba Vì",
    "Phúc Thọ",
    "Đan Phượng",
    "Hoài Đức",
    "Quốc Oai",
    "Thạch Thất",
    "Chương Mỹ",
    "Thanh Oai",
    "Thường Tín",
    "Phú Xuyên",
    "Ứng Hòa",
    "Mỹ Đức",
  ],
  "Hồ Chí Minh": [
    "Tất cả quận/huyện",
    "Quận 1",
    "Quận 2",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 9",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Bình Thạnh",
    "Tân Bình",
    "Tân Phú",
    "Phú Nhuận",
    "Gò Vấp",
    "Bình Tân",
    "Thủ Đức",
    "Củ Chi",
    "Hóc Môn",
    "Bình Chánh",
    "Nhà Bè",
    "Cần Giờ",
  ],
  "Đà Nẵng": [
    "Tất cả quận/huyện",
    "Hải Châu",
    "Thanh Khê",
    "Sơn Trà",
    "Ngũ Hành Sơn",
    "Liên Chiểu",
    "Cẩm Lệ",
    "Hòa Vang",
    "Hoàng Sa",
  ],
  "Hải Phòng": [
    "Tất cả quận/huyện",
    "Hồng Bàng",
    "Ngô Quyền",
    "Lê Chân",
    "Hải An",
    "Kiến An",
    "Đồ Sơn",
    "Dương Kinh",
    "Thuỷ Nguyên",
    "An Dương",
    "An Lão",
    "Kiến Thuỵ",
    "Tiên Lãng",
    "Vĩnh Bảo",
    "Cát Hải",
    "Bạch Long Vĩ",
  ],
  "Cần Thơ": [
    "Tất cả quận/huyện",
    "Ninh Kiều",
    "Ô Môn",
    "Bình Thuỷ",
    "Cái Răng",
    "Thốt Nốt",
    "Vĩnh Thạnh",
    "Cờ Đỏ",
    "Phong Điền",
    "Thới Lai",
  ],
  "An Giang": [
    "Tất cả quận/huyện",
    "Long Xuyên",
    "Châu Đốc",
    "An Phú",
    "Châu Phú",
    "Châu Thành",
    "Chợ Mới",
    "Phú Tân",
    "Tân Châu",
    "Thoại Sơn",
    "Tịnh Biên",
    "Tri Tôn",
  ],
  "Bình Dương": [
    "Tất cả quận/huyện",
    "Thủ Dầu Một",
    "Dầu Tiếng",
    "Bến Cát",
    "Tân Uyên",
    "Dĩ An",
    "Thuận An",
    "Bàu Bàng",
    "Bắc Tân Uyên",
  ],
  "Đồng Nai": [
    "Tất cả quận/huyện",
    "Biên Hòa",
    "Long Khánh",
    "Cẩm Mỹ",
    "Định Quán",
    "Long Thành",
    "Nhơn Trạch",
    "Tân Phú",
    "Thống Nhất",
    "Vĩnh Cửu",
    "Xuân Lộc",
  ],
  "Khánh Hòa": [
    "Tất cả quận/huyện",
    "Nha Trang",
    "Cam Ranh",
    "Cam Lâm",
    "Diên Khánh",
    "Khánh Sơn",
    "Khánh Vĩnh",
    "Ninh Hòa",
    "Trường Sa",
    "Vạn Ninh",
  ],
  "Quảng Ninh": [
    "Tất cả quận/huyện",
    "Hạ Long",
    "Móng Cái",
    "Cẩm Phả",
    "Uông Bí",
    "Bình Liêu",
    "Cô Tô",
    "Đầm Hà",
    "Đông Triều",
    "Hải Hà",
    "Quảng Yên",
    "Tiên Yên",
    "Vân Đồn",
  ],
};

export function TicketFilters({ currentCategory, currentCity, currentDistrict, cities }: TicketFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (currentCity && currentCity !== "all" && districtsByCity[currentCity]) {
      setAvailableDistricts(districtsByCity[currentCity]);
    } else {
      setAvailableDistricts([]);
    }
  }, [currentCity]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "Tất cả quận/huyện") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Nếu đổi city, xóa district
    if (key === "city") {
      params.delete("district");
    }
    // Giữ nguyên pathname, chỉ update search params
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mb-10 space-y-4">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={currentCategory === "all" ? "primary" : "secondary"}
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateFilter("category", "all");
          }}
        >
          Tất cả
        </Button>
        <Button
          variant={currentCategory === "movie" ? "primary" : "secondary"}
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateFilter("category", "movie");
          }}
        >
          Vé phim
        </Button>
        <Button
          variant={currentCategory === "concert" ? "primary" : "secondary"}
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateFilter("category", "concert");
          }}
        >
          Vé concert
        </Button>
        <Button
          variant={currentCategory === "event" ? "primary" : "secondary"}
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateFilter("category", "event");
          }}
        >
          Vé sự kiện
        </Button>
      </div>

      {/* Location Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-dark-text2 font-semibold">
          <MapPin className="w-5 h-5" />
          <span>Địa điểm:</span>
        </div>
        <select
          value={currentCity}
          onChange={(e) => {
            e.preventDefault();
            updateFilter("city", e.target.value);
          }}
          className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-dark-text font-semibold focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all cursor-pointer min-w-[200px]"
        >
          <option value="all">Tất cả thành phố</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* District Filter - chỉ hiện khi chọn thành phố có quận/huyện */}
        {availableDistricts.length > 0 && (
          <select
            value={currentDistrict || "Tất cả quận/huyện"}
            onChange={(e) => {
              e.preventDefault();
              updateFilter("district", e.target.value);
            }}
            className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-dark-text font-semibold focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all cursor-pointer min-w-[200px]"
          >
            {availableDistricts.map((district) => (
              <option key={district} value={district === "Tất cả quận/huyện" ? "all" : district}>
                {district}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
