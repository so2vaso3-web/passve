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
    if (
      room.buyer._id.toString() !== user._id.toString() &&
      room.seller._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine other user
    const isBuyer = room.buyer._id.toString() === user._id.toString();
    const otherUser = isBuyer ? room.seller : room.buyer;

    // Mark messages as read
    await ChatRoom.findByIdAndUpdate(roomId, {
      $set: isBuyer
        ? { unreadCountBuyer: 0 }
        : { unreadCountSeller: 0 },
    });

    return NextResponse.json({
      room: {
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

