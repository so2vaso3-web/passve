import connectDB from "../lib/mongodb";
import User from "../models/User";
import Ticket from "../models/Ticket";

type SampleTicket = {
  movieTitle: string;
  cinema: string;
  city: string;
  showDate: Date;
  showTime: string;
  seats: string;
  originalPrice: number;
  sellingPrice: number;
  category: "movie" | "concert" | "event";
  description: string;
  images: string[];
};

const sampleTickets: SampleTicket[] = [
  {
    movieTitle: "Quỷ Ăn Tạng 3",
    cinema: "CGV Vincom Center",
    city: "Hà Nội",
    showDate: new Date("2025-03-15"),
    showTime: "19:30",
    seats: "A1",
    originalPrice: 150000,
    sellingPrice: 120000,
    category: "movie" as const,
    description: "Vé chính hãng, không thể đi được nên bán lại",
    images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"],
  },
  {
    movieTitle: "Lật Mặt 8",
    cinema: "Lotte Cinema",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-20"),
    showTime: "20:00",
    seats: "B5",
    originalPrice: 180000,
    sellingPrice: 150000,
    category: "movie" as const,
    description: "Vé ghế đẹp",
    images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"],
  },
  {
    movieTitle: "Dune: Part Two",
    cinema: "CGV Landmark",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-03-25"),
    showTime: "21:00",
    seats: "C10",
    originalPrice: 200000,
    sellingPrice: 170000,
    category: "movie" as const,
    description: "Vé IMAX, view đẹp",
    images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"],
  },
  {
    movieTitle: "Concert Sơn Tùng M-TP",
    cinema: "Sân vận động Mỹ Đình",
    city: "Hà Nội",
    showDate: new Date("2025-04-01"),
    showTime: "19:00",
    seats: "VIP-12",
    originalPrice: 2000000,
    sellingPrice: 1800000,
    category: "concert" as const,
    description: "Vé VIP, view đẹp",
    images: ["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500"],
  },
  {
    movieTitle: "BlackPink World Tour",
    cinema: "Nhà thi đấu Quân khu 7",
    city: "Hà Nội",
    showDate: new Date("2025-04-15"),
    showTime: "20:00",
    seats: "A-25",
    originalPrice: 3000000,
    sellingPrice: 2800000,
    category: "concert" as const,
    description: "Vé concert, không thể đi được",
    images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"],
  },
];

async function addTicketsForUser() {
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB");

    // Tìm user "addd"
    const user = await User.findOne({ 
      $or: [
        { name: "addd" },
        { email: { $regex: /addd/i } }
      ]
    });

    if (!user) {
      console.error("❌ Không tìm thấy user 'addd'");
      process.exit(1);
    }

    console.log(`✅ Tìm thấy user: ${user.name} (${user.email})`);

    // Tính toán expireAt cho mỗi vé
    const tickets = [];
    for (let i = 0; i < 10; i++) {
      const sample = sampleTickets[i % sampleTickets.length];
      
      // Tính expireAt = showDate + showTime + 3 giờ
      const [hours, minutes] = sample.showTime.split(":").map(Number);
      const showDateTime = new Date(sample.showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      // Tạo title
      const title = sample.category === "movie" 
        ? `Vé xem phim ${sample.movieTitle} - ${sample.seats}`
        : sample.category === "concert"
        ? `Vé concert ${sample.movieTitle} - ${sample.seats}`
        : `Vé sự kiện ${sample.movieTitle} - ${sample.seats}`;

      const ticket = await Ticket.create({
        seller: user._id,
        title,
        movieTitle: sample.movieTitle,
        cinema: sample.cinema,
        city: sample.city,
        showDate: new Date(sample.showDate.getTime() + i * 2 * 24 * 60 * 60 * 1000), // Spread dates
        showTime: sample.showTime,
        seats: sample.seats,
        quantity: 1,
        originalPrice: sample.originalPrice,
        sellingPrice: sample.sellingPrice,
        images: sample.images,
        description: sample.description,
        category: sample.category,
        status: "approved", // Vé đang bán
        isExpired: false,
        expireAt: new Date(expireAt.getTime() + i * 2 * 24 * 60 * 60 * 1000), // Spread expireAt
      });

      tickets.push(ticket);
      console.log(`✅ Đã tạo vé ${i + 1}/10: ${title}`);
    }

    console.log(`\n✅ Đã tạo thành công ${tickets.length} vé cho user "${user.name}"!`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

addTicketsForUser();

