import { Hero } from "@/components/Hero";
import { TicketCard } from "@/components/TicketCard";
import { Stats } from "@/components/Stats";
import Link from "next/link";
import { Shield, Zap, CheckCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { Button } from "@/components/Button";
import { TicketFilters } from "@/components/TicketFilters";

async function getTickets(category?: string, city?: string, district?: string, sellerId?: string) {
  try {
    const db = await connectDB();
    if (!db) {
      return [];
    }

    const query: any = {
      status: { $in: ["approved", "pending"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
    };

    // Filter by category
    if (category && category !== "all") {
      if (category === "sports") {
        // Vé thể thao dùng category "event"
        query.category = "event";
        query.title = { $regex: /thể thao/i };
      } else {
        query.category = category;
      }
    }

    // Filter by city - dùng regex case-insensitive để match chính xác hơn
    if (city && city !== "all") {
      // Escape special regex characters và dùng case-insensitive
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.city = { $regex: new RegExp(`^${escapedCity}$`, "i") };
    }

    // Filter by district (tìm trong cinema field)
    if (district && district !== "all" && city && city !== "all") {
      // Tìm vé có cinema chứa tên quận/huyện
      const escapedDistrict = district.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.cinema = { $regex: new RegExp(escapedDistrict, "i") };
    }

    // Filter by seller
    if (sellerId) {
      query.seller = sellerId;
    }

    const tickets = await Ticket.find(query)
      .populate({
        path: "seller",
        select: "name email image isActive",
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .maxTimeMS(3000) // Timeout 3 giây
      .lean();

    return tickets
      .filter((ticket: any) => {
        if (!ticket.seller) return false;
        if (ticket.seller.isActive === false) return false;
        return true;
      })
      .map((ticket: any) => ({
        id: ticket._id.toString(),
        title: ticket.title,
        category: ticket.category,
        price: ticket.sellingPrice,
        originalPrice: ticket.originalPrice,
        location: `${ticket.cinema}, ${ticket.city}`,
        image: ticket.images?.[0] || ticket.moviePoster,
        showDate: ticket.showDate,
        showTime: ticket.showTime,
        expireAt: ticket.expireAt,
        isExpired: ticket.isExpired,
        seller: {
          name: ticket.seller?.name || "Unknown",
          avatar: ticket.seller?.image,
          _id: ticket.seller?._id?.toString(),
          email: ticket.seller?.email,
          phone: ticket.seller?.phone,
          rating: ticket.seller?.rating || 0,
          totalReviews: ticket.seller?.totalReviews || 0,
        },
        createdAt: ticket.createdAt,
        movieTitle: ticket.movieTitle,
        cinema: ticket.cinema,
        city: ticket.city,
        seats: ticket.seats,
        status: ticket.status,
        onHoldBy: ticket.onHoldBy?.toString(),
      }));
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

async function getCities() {
  try {
    const db = await connectDB();
    if (!db) {
      // Trả về danh sách tỉnh thành phố mặc định nếu không có DB
      return getDefaultCities();
    }

    const cities = await Ticket.distinct("city", {
      status: { $in: ["approved", "pending"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
    });

    // Merge với danh sách mặc định
    const defaultCities = getDefaultCities();
    const allCities = [...new Set([...cities, ...defaultCities])];
    
    // Normalize và deduplicate: loại bỏ trùng lặp case-insensitive
    const normalizedMap = new Map<string, string>();
    
    // Ưu tiên format từ defaultCities (có dấu, viết hoa đúng)
    defaultCities.forEach(city => {
      const normalized = city.toLowerCase().trim();
      if (!normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, city);
      }
    });
    
    // Thêm cities từ database, giữ format tốt nhất
    cities.forEach(city => {
      if (!city) return;
      const normalized = city.toLowerCase().trim();
      if (!normalizedMap.has(normalized)) {
        // Nếu chưa có, thêm vào
        normalizedMap.set(normalized, city);
      } else {
        // Nếu đã có, ưu tiên format có dấu và viết hoa đúng
        const existing = normalizedMap.get(normalized)!;
        // Nếu city mới có format tốt hơn (có dấu, viết hoa), thay thế
        if (city !== existing && /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(city)) {
          // Nếu city mới có dấu tiếng Việt, ưu tiên nó
          if (!/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(existing)) {
            normalizedMap.set(normalized, city);
          }
        }
      }
    });
    
    // Chuyển về array và sort
    const uniqueCities = Array.from(normalizedMap.values());
    return uniqueCities.sort();
  } catch (error) {
    console.error("Error fetching cities:", error);
    return getDefaultCities();
  }
}

function getDefaultCities() {
  return [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Bangkok",
    "Singapore",
    "Kuala Lumpur",
    "Manila",
    "Jakarta",
  ];
}

export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache 30 giây (giảm từ 60s)

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; district?: string; seller?: string };
}) {
  const category = searchParams.category || "all";
  const city = searchParams.city || "all";
  const district = searchParams.district || "all";
  const sellerId = searchParams.seller;
  const tickets = await getTickets(category, city, district, sellerId);
  const cities = await getCities();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <Hero />

      {/* Tickets Section */}
      <section id="tickets" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-dark-text mb-2">
              Vé đang bán
            </h2>
            <p className="text-dark-text2">
              Khám phá các vé phim, vé concert và vé sự kiện đang được rao bán
            </p>
          </div>
          <Button
            as={Link}
            href="/sell"
            variant="primary"
            size="md"
            className="whitespace-nowrap"
          >
            + Đăng bán vé
          </Button>
        </div>

        {/* Filters */}
        <TicketFilters 
          currentCategory={category} 
          currentCity={city} 
          currentDistrict={district}
          cities={cities} 
        />

        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} {...ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl shadow-card">
            <p className="text-dark-text2 text-lg mb-4">
              {category !== "all" || city !== "all"
                ? "Không tìm thấy vé phù hợp với bộ lọc"
                : "Chưa có vé nào được đăng bán"}
            </p>
            <Button
              as={Link}
              href="/sell"
              variant="primary"
            >
              Đăng bán vé đầu tiên
            </Button>
          </div>
        )}

        {/* Load More */}
        {tickets.length > 0 && tickets.length >= 20 && (
          <div className="text-center mt-12">
            <Button variant="secondary" size="md">
              Xem thêm
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-dark-card border-t border-dark-border py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-text text-center mb-8 sm:mb-12">
            Tại sao chọn Pass Vé Phim?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                An toàn tuyệt đối
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Hệ thống escrow tự động, tiền được giữ an toàn cho đến khi bạn nhận được vé
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                Giao dịch nhanh chóng
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Thanh toán và nhận vé chỉ trong vài phút, không cần chờ đợi
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                Đáng tin cậy
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Hệ thống đánh giá và xác minh người bán, đảm bảo uy tín
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Cuối trang */}
      <Stats />
    </div>
  );
}

import { Stats } from "@/components/Stats";
import Link from "next/link";
import { Shield, Zap, CheckCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { Button } from "@/components/Button";
import { TicketFilters } from "@/components/TicketFilters";

async function getTickets(category?: string, city?: string, district?: string, sellerId?: string) {
  try {
    const db = await connectDB();
    if (!db) {
      return [];
    }

    const query: any = {
      status: { $in: ["approved", "pending"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
    };

    // Filter by category
    if (category && category !== "all") {
      if (category === "sports") {
        // Vé thể thao dùng category "event"
        query.category = "event";
        query.title = { $regex: /thể thao/i };
      } else {
        query.category = category;
      }
    }

    // Filter by city - dùng regex case-insensitive để match chính xác hơn
    if (city && city !== "all") {
      // Escape special regex characters và dùng case-insensitive
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.city = { $regex: new RegExp(`^${escapedCity}$`, "i") };
    }

    // Filter by district (tìm trong cinema field)
    if (district && district !== "all" && city && city !== "all") {
      // Tìm vé có cinema chứa tên quận/huyện
      const escapedDistrict = district.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.cinema = { $regex: new RegExp(escapedDistrict, "i") };
    }

    // Filter by seller
    if (sellerId) {
      query.seller = sellerId;
    }

    const tickets = await Ticket.find(query)
      .populate({
        path: "seller",
        select: "name email image isActive",
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .maxTimeMS(3000) // Timeout 3 giây
      .lean();

    return tickets
      .filter((ticket: any) => {
        if (!ticket.seller) return false;
        if (ticket.seller.isActive === false) return false;
        return true;
      })
      .map((ticket: any) => ({
        id: ticket._id.toString(),
        title: ticket.title,
        category: ticket.category,
        price: ticket.sellingPrice,
        originalPrice: ticket.originalPrice,
        location: `${ticket.cinema}, ${ticket.city}`,
        image: ticket.images?.[0] || ticket.moviePoster,
        showDate: ticket.showDate,
        showTime: ticket.showTime,
        expireAt: ticket.expireAt,
        isExpired: ticket.isExpired,
        seller: {
          name: ticket.seller?.name || "Unknown",
          avatar: ticket.seller?.image,
          _id: ticket.seller?._id?.toString(),
          email: ticket.seller?.email,
          phone: ticket.seller?.phone,
          rating: ticket.seller?.rating || 0,
          totalReviews: ticket.seller?.totalReviews || 0,
        },
        createdAt: ticket.createdAt,
        movieTitle: ticket.movieTitle,
        cinema: ticket.cinema,
        city: ticket.city,
        seats: ticket.seats,
        status: ticket.status,
        onHoldBy: ticket.onHoldBy?.toString(),
      }));
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

async function getCities() {
  try {
    const db = await connectDB();
    if (!db) {
      // Trả về danh sách tỉnh thành phố mặc định nếu không có DB
      return getDefaultCities();
    }

    const cities = await Ticket.distinct("city", {
      status: { $in: ["approved", "pending"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
    });

    // Merge với danh sách mặc định
    const defaultCities = getDefaultCities();
    const allCities = [...new Set([...cities, ...defaultCities])];
    
    // Normalize và deduplicate: loại bỏ trùng lặp case-insensitive
    const normalizedMap = new Map<string, string>();
    
    // Ưu tiên format từ defaultCities (có dấu, viết hoa đúng)
    defaultCities.forEach(city => {
      const normalized = city.toLowerCase().trim();
      if (!normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, city);
      }
    });
    
    // Thêm cities từ database, giữ format tốt nhất
    cities.forEach(city => {
      if (!city) return;
      const normalized = city.toLowerCase().trim();
      if (!normalizedMap.has(normalized)) {
        // Nếu chưa có, thêm vào
        normalizedMap.set(normalized, city);
      } else {
        // Nếu đã có, ưu tiên format có dấu và viết hoa đúng
        const existing = normalizedMap.get(normalized)!;
        // Nếu city mới có format tốt hơn (có dấu, viết hoa), thay thế
        if (city !== existing && /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(city)) {
          // Nếu city mới có dấu tiếng Việt, ưu tiên nó
          if (!/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(existing)) {
            normalizedMap.set(normalized, city);
          }
        }
      }
    });
    
    // Chuyển về array và sort
    const uniqueCities = Array.from(normalizedMap.values());
    return uniqueCities.sort();
  } catch (error) {
    console.error("Error fetching cities:", error);
    return getDefaultCities();
  }
}

function getDefaultCities() {
  return [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Bangkok",
    "Singapore",
    "Kuala Lumpur",
    "Manila",
    "Jakarta",
  ];
}

export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache 30 giây (giảm từ 60s)

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; district?: string; seller?: string };
}) {
  const category = searchParams.category || "all";
  const city = searchParams.city || "all";
  const district = searchParams.district || "all";
  const sellerId = searchParams.seller;
  const tickets = await getTickets(category, city, district, sellerId);
  const cities = await getCities();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <Hero />

      {/* Tickets Section */}
      <section id="tickets" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-dark-text mb-2">
              Vé đang bán
            </h2>
            <p className="text-dark-text2">
              Khám phá các vé phim, vé concert và vé sự kiện đang được rao bán
            </p>
          </div>
          <Button
            as={Link}
            href="/sell"
            variant="primary"
            size="md"
            className="whitespace-nowrap"
          >
            + Đăng bán vé
          </Button>
        </div>

        {/* Filters */}
        <TicketFilters 
          currentCategory={category} 
          currentCity={city} 
          currentDistrict={district}
          cities={cities} 
        />

        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} {...ticket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl shadow-card">
            <p className="text-dark-text2 text-lg mb-4">
              {category !== "all" || city !== "all"
                ? "Không tìm thấy vé phù hợp với bộ lọc"
                : "Chưa có vé nào được đăng bán"}
            </p>
            <Button
              as={Link}
              href="/sell"
              variant="primary"
            >
              Đăng bán vé đầu tiên
            </Button>
          </div>
        )}

        {/* Load More */}
        {tickets.length > 0 && tickets.length >= 20 && (
          <div className="text-center mt-12">
            <Button variant="secondary" size="md">
              Xem thêm
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-dark-card border-t border-dark-border py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-dark-text text-center mb-8 sm:mb-12">
            Tại sao chọn Pass Vé Phim?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                An toàn tuyệt đối
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Hệ thống escrow tự động, tiền được giữ an toàn cho đến khi bạn nhận được vé
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                Giao dịch nhanh chóng
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Thanh toán và nhận vé chỉ trong vài phút, không cần chờ đợi
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-6 rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
              <div className="w-16 h-16 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-dark-text mb-2">
                Đáng tin cậy
              </h3>
              <p className="text-dark-text2 leading-relaxed">
                Hệ thống đánh giá và xác minh người bán, đảm bảo uy tín
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Cuối trang */}
      <Stats />
    </div>
  );
}
