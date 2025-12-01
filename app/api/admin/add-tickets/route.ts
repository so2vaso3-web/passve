import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const sampleTickets = [
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    await connectDB();

    // Kiểm tra quyền admin hoặc cho phép user tự thêm vé cho mình
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { username, count = 10 } = body;

    // Tìm user cần thêm vé
    let targetUser = user;
    if (username && username !== user.name && user.role !== "admin") {
      return NextResponse.json(
        { error: "Bạn không có quyền thêm vé cho user khác" },
        { status: 403 }
      );
    }

    if (username && user.role === "admin") {
      // Admin có thể thêm vé cho user khác
      const foundUser = await User.findOne({
        $or: [
          { name: username },
          { email: { $regex: new RegExp(username, "i") } }
        ]
      });

      if (!foundUser) {
        return NextResponse.json(
          { error: `Không tìm thấy user "${username}"` },
          { status: 404 }
        );
      }
      targetUser = foundUser;
    } else if (username) {
      // User thường chỉ có thể thêm cho chính mình
      targetUser = user;
    }

    console.log(`✅ Tìm thấy user: ${targetUser.name} (${targetUser.email})`);

    // Tạo vé
    const tickets = [];
    for (let i = 0; i < count; i++) {
      const sample = sampleTickets[i % sampleTickets.length];
      
      // Tính expireAt = showDate + showTime + 3 giờ
      const [hours, minutes] = sample.showTime.split(":").map(Number);
      const showDateTime = new Date(sample.showDate);
      showDateTime.setHours(hours, minutes, 0, 0);
      const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
      const isExpired = expireAt < new Date();

      // Tạo title
      const sampleAny = sample as any;
      const title = sample.category === "movie" 
        ? `Vé xem phim ${sampleAny.movieTitle} - ${sampleAny.seats}`
        : sample.category === "concert"
        ? `Vé concert ${sampleAny.movieTitle} - ${sampleAny.seats}`
        : `Vé sự kiện ${sampleAny.movieTitle} - ${sampleAny.seats}`;

      const ticket = await Ticket.create({
        seller: targetUser._id,
        title,
        movieTitle: sampleAny.movieTitle,
        cinema: sampleAny.cinema,
        city: sampleAny.city,
        showDate: new Date(sampleAny.showDate.getTime() + i * 2 * 24 * 60 * 60 * 1000),
        showTime: sampleAny.showTime,
        seats: sampleAny.seats,
        quantity: 1,
        originalPrice: sample.originalPrice,
        sellingPrice: sample.sellingPrice,
        images: sample.images,
        description: sample.description,
        category: sample.category,
        status: "approved", // Vé đang bán
        isExpired: false,
        expireAt: new Date(expireAt.getTime() + i * 2 * 24 * 60 * 60 * 1000),
      });

      tickets.push(ticket);
    }

    // Revalidate
    revalidatePath("/");
    revalidatePath("/profile");
    revalidateTag("tickets");
    revalidateTag("stats");

    return NextResponse.json({
      success: true,
      message: `Đã tạo thành công ${tickets.length} vé cho user "${targetUser.name}"`,
      ticketsCount: tickets.length,
      userId: targetUser._id.toString(),
      userName: targetUser.name,
    });
  } catch (error: any) {
    console.error("Error adding tickets:", error);
    return NextResponse.json(
      {
        error: error.message || "Có lỗi xảy ra khi thêm vé",
      },
      { status: 500 }
    );
  }
}

