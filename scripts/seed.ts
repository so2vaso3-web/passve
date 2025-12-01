import connectDB from "../lib/mongodb";
import User from "../models/User";
import Ticket from "../models/Ticket";

const sampleTickets = [
  {
    movieTitle: "Quỷ Ăn Tạng 3",
    movieId: 123456,
    moviePoster: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    cinema: "CGV Vincom Center",
    city: "Hà Nội",
    showDate: new Date("2025-02-15"),
    showTime: "19:30",
    seats: ["A1", "A2"],
    originalPrice: 150000,
    sellingPrice: 120000,
    category: "movie",
    description: "Vé chính hãng, không thể đi được nên bán lại",
    images: [
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500",
    ],
  },
  {
    movieTitle: "Lật Mặt 8",
    movieId: 789012,
    moviePoster: "https://image.tmdb.org/t/p/w500/example.jpg",
    cinema: "Lotte Cinema",
    city: "Hồ Chí Minh",
    showDate: new Date("2025-02-20"),
    showTime: "20:00",
    seats: ["B5", "B6", "B7"],
    originalPrice: 180000,
    sellingPrice: 150000,
    category: "movie",
    description: "3 vé liền kề, ghế đẹp",
    images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"],
  },
  {
    movieTitle: "Concert Sơn Tùng M-TP",
    cinema: "Sân vận động Mỹ Đình",
    city: "Hà Nội",
    showDate: new Date("2025-03-01"),
    showTime: "19:00",
    seats: ["VIP-12"],
    originalPrice: 2000000,
    sellingPrice: 1800000,
    category: "concert",
    description: "Vé VIP, view đẹp",
    images: ["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500"],
  },
  {
    movieTitle: "BlackPink World Tour - Hanoi",
    cinema: "Nhà thi đấu Quân khu 7",
    city: "Hà Nội",
    showDate: new Date("2025-03-15"),
    showTime: "20:00",
    seats: ["A-25", "A-26"],
    originalPrice: 3000000,
    sellingPrice: 2800000,
    category: "concert",
    description: "2 vé liền kề, không thể đi được",
    images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Tạo admin user
    const admin = await User.findOneAndUpdate(
      { email: "admin@passvephim.com" },
      {
        name: "Admin",
        email: "admin@passvephim.com",
        role: "admin",
        wallet: 0,
      },
      { upsert: true, new: true }
    );
    console.log("Admin user created:", admin.email);

    // Tạo sample users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.findOneAndUpdate(
        { email: `user${i}@example.com` },
        {
          name: `Người dùng ${i}`,
          email: `user${i}@example.com`,
          role: "user",
          wallet: Math.floor(Math.random() * 1000000),
          rating: 4 + Math.random(),
          totalReviews: Math.floor(Math.random() * 50),
        },
        { upsert: true, new: true }
      );
      users.push(user);
    }
    console.log(`Created ${users.length} sample users`);

    // Xóa tickets cũ
    await Ticket.deleteMany({});
    console.log("Cleared old tickets");

    // Tạo sample tickets
    const tickets = [];
    for (let i = 0; i < 30; i++) {
      const sample = sampleTickets[i % sampleTickets.length];
      const seller = users[Math.floor(Math.random() * users.length)];

      const ticket = await Ticket.create({
        ...sample,
        seller: seller._id,
        title: `${sample.movieTitle} - ${sample.cinema}`,
        status: i < 20 ? "approved" : "pending", // 20 approved, 10 pending
        showDate: new Date(sample.showDate.getTime() + i * 24 * 60 * 60 * 1000), // Spread dates
      });
      tickets.push(ticket);
    }
    console.log(`Created ${tickets.length} sample tickets`);

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();



