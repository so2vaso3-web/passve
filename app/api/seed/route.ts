import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const sampleMovies = [
  {
    movieTitle: "Dune: Part Two",
    cinema: "CGV Vincom Center",
    city: "Hà Nội",
    showDate: new Date("2025-02-15"),
    showTime: "20:00",
    seats: "H12, H13",
    originalPrice: 300000,
    sellingPrice: 250000,
    reason: "Không thể đi được do có việc đột xuất",
  },
  {
    movieTitle: "Deadpool & Wolverine",
    cinema: "Lotte Cinema",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-02-16"),
    showTime: "19:30",
    seats: "E8, E9",
    originalPrice: 280000,
    sellingPrice: 240000,
    reason: "Đổi lịch công việc",
  },
  {
    movieTitle: "Inside Out 2",
    cinema: "BHD Star Cineplex",
    city: "Hà Nội",
    showDate: new Date("2025-02-17"),
    showTime: "18:00",
    seats: "F15, F16",
    originalPrice: 250000,
    sellingPrice: 220000,
    reason: "Bạn bè không đi được",
  },
  {
    movieTitle: "Kung Fu Panda 4",
    cinema: "CGV Landmark",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-02-18"),
    showTime: "21:00",
    seats: "G10, G11",
    originalPrice: 270000,
    sellingPrice: 230000,
    reason: "Có việc gấp",
  },
  {
    movieTitle: "Godzilla x Kong",
    cinema: "Galaxy Cinema",
    city: "Đà Nẵng",
    showDate: new Date("2025-02-19"),
    showTime: "20:30",
    seats: "I5, I6",
    originalPrice: 260000,
    sellingPrice: 240000,
    reason: "Không thể đi",
  },
  {
    movieTitle: "Furiosa: A Mad Max Saga",
    cinema: "CGV Vincom",
    city: "Hà Nội",
    showDate: new Date("2025-02-20"),
    showTime: "19:00",
    seats: "D12, D13",
    originalPrice: 290000,
    sellingPrice: 260000,
    reason: "Đổi kế hoạch",
  },
];

const sampleConcerts = [
  {
    movieTitle: "Sơn Tùng M-TP Concert 2025",
    cinema: "Nhà thi đấu Quân khu 7",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-01"),
    showTime: "20:00",
    seats: "VIP A12",
    originalPrice: 2000000,
    sellingPrice: 1800000,
    reason: "Có việc đột xuất",
  },
  {
    movieTitle: "Đen Vâu Live Show",
    cinema: "Hoa Binh Theater",
    city: "Hà Nội",
    showDate: new Date("2025-03-05"),
    showTime: "19:30",
    seats: "VIP B8",
    originalPrice: 1500000,
    sellingPrice: 1300000,
    reason: "Không thể đi",
  },
  {
    movieTitle: "BlackPink World Tour",
    cinema: "My Dinh Stadium",
    city: "Hà Nội",
    showDate: new Date("2025-03-10"),
    showTime: "20:00",
    seats: "STANDING A",
    originalPrice: 5000000,
    sellingPrice: 4500000,
    reason: "Đổi lịch",
  },
  {
    movieTitle: "Taylor Swift Eras Tour",
    cinema: "Singapore National Stadium",
    city: "Singapore",
    showDate: new Date("2025-03-15"),
    showTime: "19:00",
    seats: "CAT 1 ROW 10",
    originalPrice: 8000000,
    sellingPrice: 7500000,
    reason: "Có việc gấp",
  },
  {
    movieTitle: "Ed Sheeran Concert",
    cinema: "Thailand Impact Arena",
    city: "Bangkok",
    showDate: new Date("2025-03-20"),
    showTime: "20:30",
    seats: "VIP ZONE",
    originalPrice: 6000000,
    sellingPrice: 5500000,
    reason: "Không đi được",
  },
  {
    movieTitle: "IU Concert 2025",
    cinema: "Hoa Binh Theater",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-25"),
    showTime: "19:00",
    seats: "VIP C15",
    originalPrice: 3000000,
    sellingPrice: 2800000,
    reason: "Đổi kế hoạch",
  },
];

const sampleSports = [
  {
    movieTitle: "Vietnam vs Thailand - World Cup Qualifier",
    cinema: "My Dinh Stadium",
    city: "Hà Nội",
    showDate: new Date("2025-03-05"),
    showTime: "19:30",
    seats: "KHU A - HÀNG 12",
    originalPrice: 500000,
    sellingPrice: 450000,
    reason: "Có việc đột xuất",
  },
  {
    movieTitle: "Vietnam vs Indonesia - AFF Cup",
    cinema: "Thong Nhat Stadium",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-08"),
    showTime: "20:00",
    seats: "KHU VIP",
    originalPrice: 800000,
    sellingPrice: 700000,
    reason: "Không thể đi",
  },
  {
    movieTitle: "Vietnam vs Malaysia - Friendly",
    cinema: "Hang Day Stadium",
    city: "Hà Nội",
    showDate: new Date("2025-03-12"),
    showTime: "19:00",
    seats: "KHU B - HÀNG 8",
    originalPrice: 400000,
    sellingPrice: 350000,
    reason: "Đổi lịch",
  },
  {
    movieTitle: "Vietnam vs Singapore - SEA Games",
    cinema: "Cam Pha Stadium",
    city: "Quảng Ninh",
    showDate: new Date("2025-03-15"),
    showTime: "18:30",
    seats: "KHU C - HÀNG 15",
    originalPrice: 300000,
    sellingPrice: 280000,
    reason: "Có việc gấp",
  },
  {
    movieTitle: "Vietnam vs Philippines - Asian Cup",
    cinema: "Thien Truong Stadium",
    city: "Nam Định",
    showDate: new Date("2025-03-18"),
    showTime: "20:00",
    seats: "KHU VIP",
    originalPrice: 600000,
    sellingPrice: 550000,
    reason: "Không đi được",
  },
  {
    movieTitle: "Vietnam vs Myanmar - Qualifier",
    cinema: "Go Dau Stadium",
    city: "Đồng Nai",
    showDate: new Date("2025-03-22"),
    showTime: "19:00",
    seats: "KHU A - HÀNG 10",
    originalPrice: 450000,
    sellingPrice: 400000,
    reason: "Đổi kế hoạch",
  },
];

const sampleEvents = [
  {
    movieTitle: "Tech Summit 2025",
    cinema: "National Convention Center",
    city: "Hà Nội",
    showDate: new Date("2025-03-01"),
    showTime: "09:00",
    seats: "VIP PASS",
    originalPrice: 2000000,
    sellingPrice: 1800000,
    reason: "Có việc đột xuất",
  },
  {
    movieTitle: "Vietnam Food Festival",
    cinema: "Landmark 81",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-05"),
    showTime: "10:00",
    seats: "PREMIUM TICKET",
    originalPrice: 500000,
    sellingPrice: 450000,
    reason: "Không thể đi",
  },
  {
    movieTitle: "Comic Con Vietnam 2025",
    cinema: "SECC",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-10"),
    showTime: "08:00",
    seats: "VIP 3-DAY PASS",
    originalPrice: 1500000,
    sellingPrice: 1300000,
    reason: "Đổi lịch",
  },
  {
    movieTitle: "Startup Weekend",
    cinema: "Innovation Hub",
    city: "Hà Nội",
    showDate: new Date("2025-03-12"),
    showTime: "09:30",
    seats: "EARLY BIRD",
    originalPrice: 800000,
    sellingPrice: 700000,
    reason: "Có việc gấp",
  },
  {
    movieTitle: "Music Festival 2025",
    cinema: "Hoan Kiem Lake",
    city: "Hà Nội",
    showDate: new Date("2025-03-15"),
    showTime: "18:00",
    seats: "GOLDEN ZONE",
    originalPrice: 1200000,
    sellingPrice: 1100000,
    reason: "Không đi được",
  },
  {
    movieTitle: "Fashion Week Vietnam",
    cinema: "Grand Plaza",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-20"),
    showTime: "19:00",
    seats: "FRONT ROW",
    originalPrice: 3000000,
    sellingPrice: 2800000,
    reason: "Đổi kế hoạch",
  },
];

export async function GET() {
  try {
    await connectDB();

    // Tìm hoặc tạo user mẫu
    let seller = await User.findOne({ email: "seller@example.com" });
    if (!seller) {
      seller = await User.create({
        name: "Nguyễn Văn A",
        email: "seller@example.com",
        image: undefined,
        role: "user",
        rating: 4.8,
        totalReviews: 50,
        isActive: true, // Đảm bảo user active
      });
    } else {
      // Đảm bảo user active
      seller.isActive = true;
      await seller.save();
    }

    const tickets = [];

    // Tạo vé phim
    for (const data of sampleMovies) {
      // Đảm bảo showDate trong tương lai (ít nhất 1 ngày)
      const showDate = new Date(data.showDate);
      if (showDate < new Date()) {
        showDate.setDate(showDate.getDate() + 30); // Thêm 30 ngày nếu đã qua
      }
      
      const [hours, minutes] = data.showTime.split(":").map(Number);
      const showDateTime = new Date(showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      const ticket = await Ticket.create({
        seller: seller._id,
        title: `Vé xem phim ${data.movieTitle} - ${data.seats}`,
        movieTitle: data.movieTitle,
        cinema: data.cinema,
        city: data.city,
        showDate: showDate,
        showTime: data.showTime,
        seats: data.seats,
        quantity: 2,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        images: [],
        reason: data.reason,
        description: `Vé xem phim ${data.movieTitle} tại ${data.cinema}, ${data.city}. Ghế ${data.seats}. Lý do bán: ${data.reason}`,
        category: "movie",
        status: "approved", // Luôn approved để hiển thị
        isExpired: false,
        expireAt,
      });
      tickets.push(ticket);
    }

    // Tạo vé concert
    for (const data of sampleConcerts) {
      const showDate = new Date(data.showDate);
      if (showDate < new Date()) {
        showDate.setDate(showDate.getDate() + 30);
      }
      
      const [hours, minutes] = data.showTime.split(":").map(Number);
      const showDateTime = new Date(showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      const ticket = await Ticket.create({
        seller: seller._id,
        title: `Vé concert ${data.movieTitle} - ${data.seats}`,
        movieTitle: data.movieTitle,
        cinema: data.cinema,
        city: data.city,
        showDate: showDate,
        showTime: data.showTime,
        seats: data.seats,
        quantity: 1,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        images: [],
        reason: data.reason,
        description: `Vé concert ${data.movieTitle} tại ${data.cinema}, ${data.city}. Ghế ${data.seats}. Lý do bán: ${data.reason}`,
        category: "concert",
        status: "approved",
        isExpired: false,
        expireAt,
      });
      tickets.push(ticket);
    }

    // Tạo vé thể thao
    for (const data of sampleSports) {
      const showDate = new Date(data.showDate);
      if (showDate < new Date()) {
        showDate.setDate(showDate.getDate() + 30);
      }
      
      const [hours, minutes] = data.showTime.split(":").map(Number);
      const showDateTime = new Date(showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      const ticket = await Ticket.create({
        seller: seller._id,
        title: `Vé thể thao ${data.movieTitle} - ${data.seats}`,
        movieTitle: data.movieTitle,
        cinema: data.cinema,
        city: data.city,
        showDate: showDate,
        showTime: data.showTime,
        seats: data.seats,
        quantity: 2,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        images: [],
        reason: data.reason,
        description: `Vé thể thao ${data.movieTitle} tại ${data.cinema}, ${data.city}. Ghế ${data.seats}. Lý do bán: ${data.reason}`,
        category: "event", // Vé thể thao dùng category "event"
        status: "approved",
        isExpired: false,
        expireAt,
      });
      tickets.push(ticket);
    }

    // Tạo vé sự kiện
    for (const data of sampleEvents) {
      const showDate = new Date(data.showDate);
      if (showDate < new Date()) {
        showDate.setDate(showDate.getDate() + 30);
      }
      
      const [hours, minutes] = data.showTime.split(":").map(Number);
      const showDateTime = new Date(showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      const ticket = await Ticket.create({
        seller: seller._id,
        title: `Vé sự kiện ${data.movieTitle} - ${data.seats}`,
        movieTitle: data.movieTitle,
        cinema: data.cinema,
        city: data.city,
        showDate: showDate,
        showTime: data.showTime,
        seats: data.seats,
        quantity: 1,
        originalPrice: data.originalPrice,
        sellingPrice: data.sellingPrice,
        images: [],
        reason: data.reason,
        description: `Vé sự kiện ${data.movieTitle} tại ${data.cinema}, ${data.city}. Ghế ${data.seats}. Lý do bán: ${data.reason}`,
        category: "event",
        status: "approved",
        isExpired: false,
        expireAt,
      });
      tickets.push(ticket);
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${tickets.length} vé mẫu thành công!`,
      tickets: tickets.length,
      breakdown: {
        movies: sampleMovies.length,
        concerts: sampleConcerts.length,
        sports: sampleSports.length,
        events: sampleEvents.length,
      },
    });
  } catch (error: any) {
    console.error("Error seeding tickets:", error);
    return NextResponse.json(
      {
        error: "Có lỗi xảy ra khi tạo vé mẫu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

