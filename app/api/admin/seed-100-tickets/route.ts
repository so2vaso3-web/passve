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

// Danh sách concert
const concerts = [
  "Sơn Tùng M-TP Concert",
  "BlackPink World Tour",
  "Taylor Swift Eras Tour",
  "Ed Sheeran Concert",
  "The Weeknd Concert",
  "BTS World Tour",
  "Ariana Grande Concert",
  "Billie Eilish Concert",
  "Post Malone Concert",
  "Dua Lipa Concert",
  "Coldplay Concert",
  "Maroon 5 Concert",
  "Imagine Dragons Concert",
  "OneRepublic Concert",
  "Bruno Mars Concert",
  "Justin Bieber Concert",
  "The Chainsmokers Concert",
  "Marshmello Concert",
  "Alan Walker Concert",
  "Martin Garrix Concert",
];

// Danh sách sự kiện
const events = [
  "Lễ hội âm nhạc quốc tế",
  "Festival điện ảnh",
  "Hội chợ công nghệ",
  "Triển lãm nghệ thuật",
  "Hội thảo công nghệ",
  "Workshop sáng tạo",
  "Sự kiện thể thao",
  "Giải đấu eSports",
  "Hội chợ ẩm thực",
  "Lễ hội văn hóa",
  "Sự kiện thời trang",
  "Show diễn thời trang",
  "Hội chợ sách",
  "Triển lãm nhiếp ảnh",
  "Sự kiện từ thiện",
  "Gala trao giải",
  "Hội nghị doanh nghiệp",
  "Sự kiện networking",
  "Workshop kỹ năng",
  "Sự kiện giáo dục",
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

// Danh sách địa điểm concert
const concertVenues = [
  "Sân vận động Mỹ Đình",
  "Nhà thi đấu Quân khu 7",
  "Trung tâm Hội nghị Quốc gia",
  "Nhà hát Lớn Hà Nội",
  "Nhà hát Thành phố Hồ Chí Minh",
  "Sân vận động Thống Nhất",
  "Trung tâm Hội nghị White Palace",
  "Nhà thi đấu Phú Thọ",
  "Sân vận động Hàng Đẫy",
  "Trung tâm Văn hóa Nghệ thuật",
];

// Danh sách địa điểm sự kiện
const eventVenues = [
  "Trung tâm Hội nghị Quốc gia",
  "Trung tâm Triển lãm Giảng Võ",
  "Trung tâm Hội chợ Triển lãm Việt Nam",
  "Bảo tàng Lịch sử Việt Nam",
  "Bảo tàng Mỹ thuật Việt Nam",
  "Trung tâm Văn hóa Nghệ thuật",
  "Nhà hát Lớn Hà Nội",
  "Trung tâm Hội nghị White Palace",
  "Khách sạn InterContinental",
  "Trung tâm Hội nghị Sài Gòn",
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

    // Danh sách tên người Việt Nam thật
    const vietnameseNames = [
      "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Cường", "Phạm Thị Dung", "Hoàng Văn Đức",
      "Vũ Thị Hương", "Đặng Văn Hùng", "Bùi Thị Lan", "Phan Văn Long", "Ngô Thị Mai",
      "Đỗ Văn Nam", "Võ Thị Nga", "Lý Văn Phong", "Trương Thị Quỳnh", "Đinh Văn Sơn",
      "Dương Thị Tâm", "Lưu Văn Tuấn", "Chu Thị Uyên", "Hồ Văn Việt", "Nguyễn Thị Anh",
      "Trần Minh Bảo", "Lê Thị Chi", "Phạm Văn Dũng", "Hoàng Thị Giang", "Vũ Văn Hải",
      "Đặng Thị Hoa", "Bùi Văn Khánh", "Phan Thị Linh", "Ngô Văn Mạnh", "Đỗ Thị Nhung",
      "Võ Văn Oanh", "Lý Thị Phương", "Trương Văn Quang", "Đinh Thị Sen", "Dương Văn Thành",
      "Lưu Thị Thảo", "Chu Văn Thắng", "Hồ Thị Thu", "Nguyễn Văn Tiến", "Trần Thị Uyên",
      "Lê Văn Vinh", "Phạm Thị Xuân", "Hoàng Văn Yên", "Vũ Thị Ánh", "Đặng Văn Bình",
      "Bùi Thị Cẩm", "Phan Văn Đạt", "Ngô Thị Em", "Đỗ Văn Giang", "Võ Thị Hạnh",
      "Lý Văn Hiếu", "Trương Thị Kim", "Đinh Văn Lâm", "Dương Thị My", "Lưu Văn Nghĩa",
      "Chu Thị Oanh", "Hồ Văn Phúc", "Nguyễn Thị Quyên", "Trần Văn Sang", "Lê Thị Thanh",
      "Phạm Văn Thắng", "Hoàng Thị Trang", "Vũ Văn Tuấn", "Đặng Thị Uyên", "Bùi Văn Vinh",
      "Phan Thị Xoan", "Ngô Văn Anh", "Đỗ Thị Bích", "Võ Văn Cường", "Lý Thị Dung",
      "Trương Văn Đức", "Đinh Thị Hương", "Dương Văn Hùng", "Lưu Thị Lan", "Chu Văn Long",
      "Hồ Thị Mai", "Nguyễn Văn Nam", "Trần Thị Nga", "Lê Văn Phong", "Phạm Thị Quỳnh",
      "Hoàng Văn Sơn", "Vũ Thị Tâm", "Đặng Văn Tuấn", "Bùi Thị Uyên", "Phan Văn Việt",
      "Ngô Thị Yến", "Đỗ Văn Bảo", "Võ Thị Chi", "Lý Văn Dũng", "Trương Thị Giang",
      "Đinh Văn Hải", "Dương Thị Hoa", "Lưu Văn Khánh", "Chu Thị Linh", "Hồ Văn Mạnh",
      "Nguyễn Thị Nhung", "Trần Văn Oanh", "Lê Thị Phương", "Phạm Văn Quang", "Hoàng Thị Sen",
      "Vũ Văn Thành", "Đặng Thị Thảo", "Bùi Văn Thắng", "Phan Thị Thu", "Ngô Văn Tiến",
    ];

    // Lấy hoặc tạo 100 users với tên thật và avatar khác nhau
    console.log("👥 Creating/Getting 100 users...");
    const users = [];
    
    for (let i = 0; i < 100; i++) {
      const email = `seller${i + 1}@example.com`;
      let user = await User.findOne({ email });
      
      const realName = vietnameseNames[i] || `Người bán ${i + 1}`;
      
      if (!user) {
        // Tạo user mới với tên thật và avatar từ i.pravatar.cc (ổn định hơn)
        // Dùng số thứ tự để mỗi user có avatar khác nhau
        const avatarId = (i % 70) + 1; // 70 avatars khác nhau, lặp lại
        const avatarUrl = `https://i.pravatar.cc/200?img=${avatarId}`;
        
        user = await User.create({
          name: realName,
          email,
          image: avatarUrl,
          role: "user",
          isActive: true,
        });
        console.log(`✅ Created user ${i + 1}/100: ${user.name}`);
      } else {
        // Update tên và avatar nếu chưa có
        if (user.name === `Người bán ${i + 1}` || !user.name) {
          user.name = realName;
        }
        if (!user.image) {
          const avatarId = (i % 70) + 1;
          const avatarUrl = `https://i.pravatar.cc/200?img=${avatarId}`;
          user.image = avatarUrl;
        }
        await user.save();
      }
      
      users.push(user);
    }

    console.log(`✅ Got ${users.length} users`);

    // Tạo 100 vé - phân bổ: 34 vé phim, 33 vé concert, 33 vé sự kiện
    console.log("🎫 Creating 100 tickets (34 movie, 33 concert, 33 event)...");
    const tickets = [];
    const categoryCounts = { movie: 0, concert: 0, event: 0 };

    for (let i = 0; i < 100; i++) {
      // Phân bổ category: 34 movie, 33 concert, 33 event
      let category: "movie" | "concert" | "event";
      let title: string;
      let movieTitle: string;
      let venue: string;
      
      if (i < 34) {
        category = "movie";
        movieTitle = movies[Math.floor(Math.random() * movies.length)];
        venue = cinemas[Math.floor(Math.random() * cinemas.length)];
        title = `Vé xem phim ${movieTitle} - ${getRandomSeats()}`;
      } else if (i < 67) {
        category = "concert";
        movieTitle = concerts[Math.floor(Math.random() * concerts.length)];
        venue = concertVenues[Math.floor(Math.random() * concertVenues.length)];
        title = `Vé concert ${movieTitle} - ${getRandomSeats()}`;
      } else {
        category = "event";
        movieTitle = events[Math.floor(Math.random() * events.length)];
        venue = eventVenues[Math.floor(Math.random() * eventVenues.length)];
        title = `Vé sự kiện ${movieTitle} - ${getRandomSeats()}`;
      }
      
      categoryCounts[category]++;
      
      const city = cities[Math.floor(Math.random() * cities.length)];
      const showTime = showTimes[Math.floor(Math.random() * showTimes.length)];
      const showDate = getRandomShowDate();
      const seats = getRandomSeats();
      const expireAt = getExpireAt(showDate, showTime);
      
      // Giá gốc và giá bán (concert và event thường đắt hơn)
      let originalPrice: number;
      if (category === "movie") {
        originalPrice = Math.floor(Math.random() * 200000) + 100000; // 100k - 300k
      } else if (category === "concert") {
        originalPrice = Math.floor(Math.random() * 2000000) + 500000; // 500k - 2.5M
      } else {
        originalPrice = Math.floor(Math.random() * 1000000) + 200000; // 200k - 1.2M
      }
      const sellingPrice = Math.floor(originalPrice * (0.7 + Math.random() * 0.3)); // 70% - 100% giá gốc
      
      // Ảnh vé giống thật - dùng Unsplash với keyword phù hợp
      let imageKeyword = "movie";
      if (category === "concert") {
        imageKeyword = "concert,music,stage";
      } else if (category === "event") {
        imageKeyword = "event,conference,meeting";
      }
      
      // Dùng Unsplash Source với keyword và seed khác nhau cho mỗi vé
      const imageId = (i % 50) + 1; // 50 ảnh khác nhau, lặp lại
      const ticketImageUrl = `https://source.unsplash.com/800x600/?${imageKeyword}&sig=${imageId}`;
      
      // Ảnh QR code (cần ít nhất 1 ảnh)
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-${i + 1}-${Date.now()}`;
      
      const seller = users[i];
      
      // Description khác nhau theo category
      let description: string;
      if (category === "movie") {
        description = `Vé xem phim ${movieTitle} tại ${venue}, ${city}. Ghế ${seats}, suất chiếu ${showTime} ngày ${showDate.toLocaleDateString("vi-VN")}.`;
      } else if (category === "concert") {
        description = `Vé concert ${movieTitle} tại ${venue}, ${city}. Ghế ${seats}, suất diễn ${showTime} ngày ${showDate.toLocaleDateString("vi-VN")}.`;
      } else {
        description = `Vé sự kiện ${movieTitle} tại ${venue}, ${city}. Ghế ${seats}, thời gian ${showTime} ngày ${showDate.toLocaleDateString("vi-VN")}.`;
      }
      
      const ticket = await Ticket.create({
        seller: seller._id,
        title,
        movieTitle,
        cinema: venue, // Dùng venue cho cả 3 loại
        city,
        showDate,
        showTime,
        seats,
        quantity: 1,
        originalPrice,
        sellingPrice: Math.max(sellingPrice, 50000), // Đảm bảo >= 50k
        images: [ticketImageUrl],
        qrImage: [qrImageUrl],
        category,
        status: "approved",
        isExpired: false,
        expireAt,
        description,
      });

      tickets.push(ticket);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/100 tickets (Movie: ${categoryCounts.movie}, Concert: ${categoryCounts.concert}, Event: ${categoryCounts.event})`);
      }
    }

    console.log(`\n🎉 Successfully created ${tickets.length} tickets!`);
    console.log(`👥 Using ${users.length} different sellers`);
    console.log(`📊 Category breakdown:`);
    console.log(`   - Vé phim: ${categoryCounts.movie}`);
    console.log(`   - Vé concert: ${categoryCounts.concert}`);
    console.log(`   - Vé sự kiện: ${categoryCounts.event}`);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${tickets.length} tickets with ${users.length} different sellers`,
      tickets: tickets.length,
      sellers: users.length,
      categories: {
        movie: categoryCounts.movie,
        concert: categoryCounts.concert,
        event: categoryCounts.event,
      },
    });
  } catch (error: any) {
    console.error("❌ Error seeding tickets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed tickets" },
      { status: 500 }
    );
  }
}

