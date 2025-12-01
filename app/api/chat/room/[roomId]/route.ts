import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
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

    const roomId = params.roomId;

    // Get room
    const room = await ChatRoom.findById(roomId)
      .populate("ticket", "movieTitle images sellingPrice cinema city showDate showTime seats")
      .populate("buyer", "name image")
      .populate("seller", "name image")
      .lean();

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is part of this room
    const buyerId = typeof room.buyer === 'object' && '_id' in room.buyer 
      ? room.buyer._id.toString() 
      : room.buyer.toString();
    const sellerId = typeof room.seller === 'object' && '_id' in room.seller 
      ? room.seller._id.toString() 
      : room.seller.toString();
    
    if (buyerId !== user._id.toString() && sellerId !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine other user
    const isBuyer = buyerId === user._id.toString();
    const otherUserRaw = isBuyer ? room.seller : room.buyer;
    const otherUser = otherUserRaw as any;

    // Mark messages as read
    await ChatRoom.findByIdAndUpdate(roomId, {
      $set: isBuyer
        ? { unreadCountBuyer: 0 }
        : { unreadCountSeller: 0 },
    });

    const ticket = room.ticket as any;
    const ticketData = ticket && typeof ticket === 'object' && '_id' in ticket
      ? {
          _id: ticket._id.toString(),
          movieTitle: ticket.movieTitle,
          images: ticket.images || [],
          sellingPrice: ticket.sellingPrice,
          cinema: ticket.cinema,
          city: ticket.city,
          showDate: ticket.showDate,
          showTime: ticket.showTime,
          seats: ticket.seats,
        }
      : null;

    return NextResponse.json({
      room: {
        _id: room._id.toString(),
        ticket: ticketData,
        otherUser: {
          _id: typeof otherUser === 'object' && '_id' in otherUser 
            ? otherUser._id.toString() 
            : otherUser.toString(),
          name: typeof otherUser === 'object' && 'name' in otherUser 
            ? otherUser.name 
            : '',
          image: typeof otherUser === 'object' && 'image' in otherUser 
            ? otherUser.image 
            : '',
          isOnline: false,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch room" },
      { status: 500 }
    );
  }
}

