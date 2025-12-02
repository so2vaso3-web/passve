import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all rooms where user is buyer or seller
    // Hiển thị TẤT CẢ rooms để user thấy tất cả tin nhắn từ tất cả tickets
    const rooms = await ChatRoom.find({
      $or: [{ buyer: user._id }, { seller: user._id }],
      isActive: true,
    })
      .populate("ticket", "movieTitle images sellingPrice cinema city showDate showTime seats")
      .populate("buyer", "name image")
      .populate("seller", "name image")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Filter out rooms with null/undefined ticket (ticket đã bị xóa)
    const validRooms = rooms.filter((room: any) => room.ticket && room.ticket._id);

    const formattedRooms = validRooms.map((room: any) => {
      const isBuyer = room.buyer._id.toString() === user._id.toString();
      const otherUser = isBuyer ? room.seller : room.buyer;
      const unreadCount = isBuyer ? room.unreadCountBuyer : room.unreadCountSeller;

      return {
        _id: room._id.toString(),
        ticket: {
          _id: room.ticket._id.toString(),
          movieTitle: room.ticket.movieTitle,
          images: room.ticket.images || [],
          sellingPrice: room.ticket.sellingPrice,
          cinema: room.ticket.cinema,
          city: room.ticket.city,
          showDate: room.ticket.showDate,
          showTime: room.ticket.showTime,
          seats: room.ticket.seats,
        },
        otherUser: {
          _id: otherUser._id.toString(),
          name: otherUser.name,
          image: otherUser.image,
          isOnline: false, // TODO: Implement real-time online status
        },
        lastMessage: room.lastMessage,
        lastMessageAt: room.lastMessageAt,
        unreadCount,
      };
    });

    console.log(`📬 [Chat Rooms API] User: ${user.email}, Found ${rooms.length} total rooms, ${validRooms.length} valid rooms (with ticket), Total unread: ${formattedRooms.reduce((sum, r) => sum + r.unreadCount, 0)}`);

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

