import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";
export const revalidate = 30; // Cache 30 giây

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      category,
      movieTitle,
      showDate,
      showTime,
      cinema,
      city,
      seats,
      quantity,
      originalPrice,
      sellingPrice,
      images,
      qrImage,
      reason,
      description,
      ticketCode,
    } = body;

    // Validate required fields
    if (!category || !["movie", "concert", "event"].includes(category)) {
      return NextResponse.json(
        { error: "Vui lòng chọn loại vé" },
        { status: 400 }
      );
    }

    if (!movieTitle || movieTitle.trim().length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên phim/sự kiện" },
        { status: 400 }
      );
    }

    if (!showDate || !showTime) {
      return NextResponse.json(
        { error: "Vui lòng chọn ngày và giờ chiếu" },
        { status: 400 }
      );
    }

    if (!cinema || !city) {
      return NextResponse.json(
        { error: "Vui lòng chọn rạp chiếu" },
        { status: 400 }
      );
    }

    if (!seats || seats.trim().length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập số ghế" },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Số lượng vé phải lớn hơn 0" },
        { status: 400 }
      );
    }

    if (!originalPrice || originalPrice < 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập giá gốc" },
        { status: 400 }
      );
    }

    if (!sellingPrice || sellingPrice < 50000) {
      return NextResponse.json(
        { error: "Giá bán lại phải lớn hơn hoặc bằng 50,000 VNĐ" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng upload ít nhất 1 ảnh vé" },
        { status: 400 }
      );
    }

    // Calculate expireAt = showDate + showTime + 3 hours
    const [hours, minutes] = showTime.split(":").map(Number);
    const showDateTime = new Date(showDate);
    showDateTime.setHours(hours, minutes, 0, 0);
    
    // Add 3 hours
    const expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);

    // Check if already expired
    const isExpired = expireAt < new Date();

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please configure MongoDB in .env.local" },
        { status: 503 }
      );
    }

    // Get user ID from database
    const User = (await import("@/models/User")).default;
    let dbUser;
    
    try {
      dbUser = await User.findOne({ email: session.user?.email }).maxTimeMS(5000);
      
      if (!dbUser && session.user?.email) {
        // Create user if not exists
        dbUser = await User.create({
          name: session.user.name || "",
          email: session.user.email,
          image: session.user.image || undefined,
          role: "user",
        });
      }
    } catch (error: any) {
      console.error("Error finding/creating user:", error);
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 401 }
      );
    }

    // Create ticket
    const ticket = await Ticket.create({
      seller: dbUser._id,
      title: category === "movie" 
        ? `Vé xem phim ${movieTitle} - ${seats}`
        : category === "concert"
        ? `Vé concert ${movieTitle} - ${seats}`
        : `Vé sự kiện ${movieTitle} - ${seats}`,
      movieTitle: movieTitle.trim(),
      cinema: cinema.trim(),
      city: city.trim(),
      showDate: new Date(showDate),
      showTime,
      seats: seats.trim(),
      quantity,
      originalPrice,
      sellingPrice,
      images,
      qrImage: qrImage || undefined,
      reason: reason || undefined,
      description: description || undefined,
      ticketCode: ticketCode?.trim() || undefined,
      category,
      status: isExpired ? "expired" : "approved", // Tự động approve để hiển thị ngay
      isExpired,
      expireAt,
    });

    // Revalidate homepage to show new ticket immediately
    revalidatePath("/");
    revalidateTag("tickets");
    revalidateTag("stats");

    // Populate seller info for response
    await ticket.populate("seller", "name email image");

    return NextResponse.json(
      { 
        success: true, 
        ticket: {
          id: ticket._id.toString(),
          title: ticket.title,
          category: ticket.category,
          price: ticket.sellingPrice,
          originalPrice: ticket.originalPrice,
          location: `${ticket.cinema}, ${ticket.city}`,
          image: ticket.images[0] || ticket.moviePoster,
          showDate: ticket.showDate,
          showTime: ticket.showTime,
          expireAt: ticket.expireAt,
          isExpired: ticket.isExpired,
          seller: {
            name: (ticket.seller as any)?.name || "Unknown",
            avatar: (ticket.seller as any)?.image,
          },
          createdAt: ticket.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi tạo tin đăng" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch tickets
export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ tickets: [] });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: any = {
      status: { $ne: "expired" },
      isExpired: false,
      expireAt: { $gt: new Date() },
    };

    // Filter by user if provided
    const userId = searchParams.get("user");
    if (userId) {
      const statusFilter = searchParams.get("status");
      
      // Get user ObjectId from email
      let userObjectId = null;
      if (userId.includes("@")) {
        // userId is email, need to find user ObjectId
        const User = (await import("@/models/User")).default;
        const user = await User.findOne({ email: userId }).select("_id").lean();
        if (user) {
          userObjectId = user._id;
        }
      } else {
        // userId is already ObjectId
        userObjectId = userId;
      }
      
      if (statusFilter === "active") {
        query.seller = userObjectId || userId;
        query.status = { $in: ["pending", "approved"] };
      } else if (statusFilter === "sold") {
        query.seller = userObjectId || userId;
        query.status = "sold";
      } else if (statusFilter === "purchased") {
        // Include both purchased (sold) and on_hold tickets
        if (userObjectId) {
          query.$or = [
            { buyer: userObjectId, status: "sold" },
            { onHoldBy: userObjectId, status: "on_hold" }
          ];
        } else {
          query.$or = [
            { buyer: userId, status: "sold" },
            { onHoldBy: userId, status: "on_hold" }
          ];
        }
      } else if (statusFilter === "on_hold") {
        query.onHoldBy = userObjectId || userId;
        query.status = "on_hold";
      }
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by city - dùng regex case-insensitive để match chính xác hơn
    const city = searchParams.get("city");
    if (city && city !== "all") {
      // Escape special regex characters và dùng exact match case-insensitive
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.city = { $regex: new RegExp(`^${escapedCity}$`, "i") };
    }

    // Filter by district (tìm trong cinema field)
    const district = searchParams.get("district");
    if (district && district !== "all" && city && city !== "all") {
      const escapedDistrict = district.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.cinema = { $regex: new RegExp(escapedDistrict, "i") };
    }

    const tickets = await Ticket.find(query)
      .populate({
        path: "seller",
        match: { isActive: { $ne: false } },
        select: "name email image isActive",
      })
      .populate({
        path: "buyer",
        select: "email",
      })
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(limit)
      .skip(skip)
      .maxTimeMS(3000) // Timeout 3 giây (giảm từ 5s)
      .lean();

    const formattedTickets = tickets
      .filter((ticket: any) => {
        // Filter out tickets from inactive users
        if (ticket.seller && !ticket.seller.isActive) {
          return false;
        }
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
        status: ticket.status,
        onHoldBy: ticket.onHoldBy?.toString(),
        onHoldAt: ticket.onHoldAt,
        ticketCode: ticket.ticketCode,
        // Hiển thị QR code cho người mua nếu đã thanh toán (sold hoặc on_hold)
        qrImage: ((ticket.status === "sold" && ticket.buyer) || (ticket.status === "on_hold" && ticket.onHoldBy)) ? ticket.qrImage : undefined,
        buyer: ticket.buyer?._id?.toString(),
        buyerEmail: ticket.buyer?.email,
        seller: {
          name: ticket.seller?.name || "Unknown",
          avatar: ticket.seller?.image,
        },
        createdAt: ticket.createdAt,
      }));

    return NextResponse.json({ tickets: formattedTickets });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách vé" },
      { status: 500 }
    );
  }
}
