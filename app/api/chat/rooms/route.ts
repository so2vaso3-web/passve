import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    // Group by otherUser để chỉ lấy 1 room duy nhất với mỗi người
    const allRooms = await ChatRoom.find({
      $or: [{ buyer: user._id }, { seller: user._id }],
      isActive: true,
    })
      .populate("ticket", "movieTitle images sellingPrice cinema city showDate showTime seats")
      .populate("buyer", "name image")
      .populate("seller", "name image")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Group rooms by otherUser - chỉ lấy room mới nhất với mỗi người
    const roomMap = new Map();
    allRooms.forEach((room: any) => {
      const isBuyer = room.buyer._id.toString() === user._id.toString();
      const otherUserId = isBuyer 
        ? room.seller._id.toString() 
        : room.buyer._id.toString();
      
      // Nếu chưa có room với người này, hoặc room này mới hơn
      if (!roomMap.has(otherUserId)) {
        roomMap.set(otherUserId, room);
      } else {
        const existingRoom = roomMap.get(otherUserId);
        const existingTime = existingRoom.lastMessageAt || existingRoom.updatedAt || existingRoom.createdAt;
        const currentTime = room.lastMessageAt || room.updatedAt || room.createdAt;
        if (new Date(currentTime) > new Date(existingTime)) {
          roomMap.set(otherUserId, room);
        }
      }
    });

    const rooms = Array.from(roomMap.values());

    const formattedRooms = rooms.map((room: any) => {
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

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

