import { Hero } from "@/components/Hero";
import { TicketCard } from "@/components/TicketCard";
import { Stats } from "@/components/Stats";
import Link from "next/link";
import { Shield, Zap, CheckCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { Button } from "@/components/Button";
import { TicketFilters } from "@/components/TicketFilters";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getTickets(category?: string, city?: string, district?: string, sellerId?: string) {
  try {
    const db = await connectDB();
    if (!db) {
      return [];
    }

    // Lấy thời gian giới hạn từ settings
    const { getSiteSettings } = await import("@/models/SiteSettings");
    const settings = await getSiteSettings();
    const timeLimitMinutes = settings?.cancellationTimeLimitMinutes || 5;
    const timeLimitMs = timeLimitMinutes * 60 * 1000; // Convert to milliseconds
    const cutoffTime = new Date(Date.now() - timeLimitMs);

    const query: any = {
      status: { $in: ["approved", "pending"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
      // Chỉ hiển thị vé:
      // 1. Chưa có người mua (chưa bán)
      // 2. Hoặc đã bán nhưng còn trong thời gian cho phép hủy (còn có thể hủy)
      // KHÔNG hiển thị vé đã bán quá thời gian giới hạn (đã quá thời gian hủy)
      $or: [
        // Vé chưa có buyer
        { buyer: { $exists: false } },
        { buyer: null },
        { buyer: { $eq: null } },
        // Vé có buyer nhưng soldAt trong khoảng thời gian cho phép hủy
        {
          buyer: { $exists: true, $ne: null },
          soldAt: { $exists: true, $gte: cutoffTime }, // soldAt >= cutoffTime (còn trong thời gian hủy)
        },
      ],
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
        soldAt: ticket.soldAt,
        buyer: ticket.buyer?.toString(),
        buyerEmail: ticket.buyer?.email,
        ticketCode: ticket.ticketCode,
        qrImage: ticket.qrImage,
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
  ];
}

export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache 30 giây (giảm từ 60s)

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; district?: string; seller?: string };
}) {
  // Check maintenance mode - check ở đây vì middleware không thể dùng mongoose
  try {
    const { getSiteSettings } = await import("@/models/SiteSettings");
    const settings = await getSiteSettings();
    
    if (settings?.maintenanceMode) {
      // Check if user is admin
      const session = await getServerSession(authOptions);
      const isAdmin = session?.user && (session.user as any)?.role === "admin";
      
      // Only show maintenance if not admin
      if (!isAdmin) {
        // Redirect to maintenance page
        const { redirect } = await import("next/navigation");
        redirect("/maintenance");
      }
    }
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
    // Continue to normal page if error
  }

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
      <section className="bg-dark-card border-t border-dark-border py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-black text-dark-text text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            Tại sao chọn Pass Vé Phim?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            <div className="text-center bg-dark-bg border border-dark-border p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.02] sm:hover:scale-[1.03] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-neon-green rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-neon-sm">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-dark-text mb-2">
                An toàn tuyệt đối
              </h3>
              <p className="text-sm sm:text-base text-dark-text2 leading-relaxed px-2 sm:px-0">
                Hệ thống escrow tự động, tiền được giữ an toàn cho đến khi bạn nhận được vé
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.02] sm:hover:scale-[1.03] transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-neon-green rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-neon-sm">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-dark-text mb-2">
                Giao dịch nhanh chóng
              </h3>
              <p className="text-sm sm:text-base text-dark-text2 leading-relaxed px-2 sm:px-0">
                Thanh toán và nhận vé chỉ trong vài phút, không cần chờ đợi
              </p>
            </div>
            <div className="text-center bg-dark-bg border border-dark-border p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-card hover:shadow-neon hover:scale-[1.02] sm:hover:scale-[1.03] transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-neon-green rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-neon-sm">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-dark-text mb-2">
                Đáng tin cậy
              </h3>
              <p className="text-sm sm:text-base text-dark-text2 leading-relaxed px-2 sm:px-0">
                Hệ thống đánh giá và xác minh người bán, đảm bảo uy tín
              </p>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 max-w-4xl mx-auto">
            <div className="bg-dark-bg border border-dark-border rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-card">
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-dark-text mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green flex-shrink-0" />
                <span>Tại sao chọn chúng tôi?</span>
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-dark-text2 leading-relaxed flex-1">
                    Mua bán vé phim, concert, sự kiện uy tín và an toàn
                  </p>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-dark-text2 leading-relaxed flex-1">
                    Hệ thống escrow tự động bảo vệ người mua và người bán
                  </p>
                </li>
                <li className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-neon-green flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-dark-text2 leading-relaxed flex-1">
                    Thanh toán nhanh chóng, tiền được cộng vào ví ngay lập tức
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Cuối trang */}
      <Stats />
    </div>
  );
}
