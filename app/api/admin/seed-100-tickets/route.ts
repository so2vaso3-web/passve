import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Ticket from "@/models/Ticket";

// Danh sách phim phổ biến
const movies = [
  "Avengers: Endgame",
  "Spider-Man: No Way Home",
  "The Batman",
  "Top Gun: Maverick",
  "Black Panther: Wakanda Forever",
  "Doctor Strange",
  "Thor: Love and Thunder",
  "Black Widow",
  "Shang-Chi",
  "Eternals",
  "Dune",
  "No Time to Die",
  "Fast & Furious 9",
  "Godzilla vs Kong",
  "Jungle Cruise",
  "Cruella",
  "The Suicide Squad",
  "Venom 2",
  "Free Guy",
  "A Quiet Place Part II",
];

// Danh sách rạp chiếu
const cinemas = [
  "CGV Vincom Center",
  "CGV Landmark",
  "CGV Crescent Mall",
  "Lotte Cinema",
  "Galaxy Cinema",
  "BHD Star Cineplex",
  "Mega GS",
  "Cinestar",
  "Beta Cinemas",
  "Platinum Cineplex",
];

// Danh sách thành phố
const cities = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nha Trang",
  "Huế",
  "Vũng Tàu",
  "Quy Nhon",
  "Đà Lạt",
];

// Giờ chiếu phổ biến
const showTimes = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00",
];

// Ghế ngẫu nhiên
const getRandomSeats = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const row = rows[Math.floor(Math.random() * rows.length)];
  const seat = Math.floor(Math.random() * 20) + 1;
  return `${row}${seat}`;
};

// Tạo ngày chiếu trong tương lai (1-30 ngày)
const getRandomShowDate = () => {
  const days = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Tạo expireAt (showDate + showTime + 3 giờ)
const getExpireAt = (showDate: Date, showTime: string) => {
  const [hours, minutes] = showTime.split(":").map(Number);
  const expireDate = new Date(showDate);
  expireDate.setHours(hours + 3, minutes, 0, 0);
  return expireDate;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔌 Connecting to database...");
    await connectDB();
    console.log("✅ Connected to database");

    // Lấy hoặc tạo 100 users với avatar khác nhau
    console.log("👥 Creating/Getting 100 users...");
    const users = [];
    
    for (let i = 0; i < 100; i++) {
      const email = `seller${i + 1}@example.com`;
      let user = await User.findOne({ email });
      
      if (!user) {
        // Tạo user mới với avatar ngẫu nhiên từ UI Avatars
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`Seller ${i + 1}`)}&background=random&color=fff&size=200`;
        
        user = await User.create({
          name: `Người bán ${i + 1}`,
          email,
          image: avatarUrl,
          role: "user",
          isActive: true,
        });
        console.log(`✅ Created user ${i + 1}/100: ${user.name}`);
      } else {
        // Update avatar nếu chưa có
        if (!user.image) {
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=200`;
          user.image = avatarUrl;
          await user.save();
        }
      }
      
      users.push(user);
    }

    console.log(`✅ Got ${users.length} users`);

    // Tạo 100 vé
    console.log("🎫 Creating 100 tickets...");
    const tickets = [];

    for (let i = 0; i < 100; i++) {
      const movie = movies[Math.floor(Math.random() * movies.length)];
      const cinema = cinemas[Math.floor(Math.random() * cinemas.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const showTime = showTimes[Math.floor(Math.random() * showTimes.length)];
      const showDate = getRandomShowDate();
      const seats = getRandomSeats();
      const expireAt = getExpireAt(showDate, showTime);
      
      // Giá gốc và giá bán
      const originalPrice = Math.floor(Math.random() * 200000) + 100000; // 100k - 300k
      const sellingPrice = Math.floor(originalPrice * (0.7 + Math.random() * 0.3)); // 70% - 100% giá gốc
      
      // Ảnh vé từ placeholder service (mỗi vé có ảnh khác nhau)
      // Dùng placeholder.com với seed khác nhau để mỗi vé có ảnh khác nhau
      const imageSeed = i + 1;
      const ticketImageUrl = `https://picsum.photos/seed/ticket${imageSeed}${Date.now()}/800/600`;
      
      // Ảnh QR code (cần ít nhất 1 ảnh)
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-${i + 1}-${Date.now()}`;
      
      const seller = users[i];
      
      const ticket = await Ticket.create({
        seller: seller._id,
        title: `Vé xem phim ${movie} - ${seats}`,
        movieTitle: movie,
        cinema,
        city,
        showDate,
        showTime,
        seats,
        quantity: 1,
        originalPrice,
        sellingPrice: Math.max(sellingPrice, 50000), // Đảm bảo >= 50k
        images: [ticketImageUrl],
        qrImage: [qrImageUrl],
        category: "movie",
        status: "approved",
        isExpired: false,
        expireAt,
        description: `Vé xem phim ${movie} tại ${cinema}, ${city}. Ghế ${seats}, suất chiếu ${showTime} ngày ${showDate.toLocaleDateString("vi-VN")}.`,
      });

      tickets.push(ticket);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/100 tickets`);
      }
    }

    console.log(`\n🎉 Successfully created ${tickets.length} tickets!`);
    console.log(`👥 Using ${users.length} different sellers`);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${tickets.length} tickets with ${users.length} different sellers`,
      tickets: tickets.length,
      sellers: users.length,
    });
  } catch (error: any) {
    console.error("❌ Error seeding tickets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed tickets" },
      { status: 500 }
    );
  }
}

