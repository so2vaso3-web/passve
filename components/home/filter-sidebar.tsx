"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function FilterSidebar() {
  const [filters, setFilters] = useState({
    category: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    showDate: "",
  });

  const cities = [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Nha Trang",
    "Huế",
    "Vũng Tàu",
  ];

  return (
    <Card className="sticky top-24">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">
          Bộ lọc
        </h3>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Loại vé
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100"
            >
              <option value="">Tất cả</option>
              <option value="movie">Phim</option>
              <option value="concert">Concert</option>
              <option value="event">Sự kiện</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Thành phố
            </label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100"
            >
              <option value="">Tất cả</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Khoảng giá
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Từ"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Đến"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Show Date */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Ngày chiếu
            </label>
            <Input
              type="date"
              value={filters.showDate}
              onChange={(e) => setFilters({ ...filters, showDate: e.target.value })}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setFilters({ category: "", city: "", minPrice: "", maxPrice: "", showDate: "" })}
            className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </Card>
  );
}

