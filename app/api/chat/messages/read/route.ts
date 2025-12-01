import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import ChatMessage from "@/models/ChatMessage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (
      room.buyer.toString() !== user._id.toString() &&
      room.seller.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark all messages as read
    await ChatMessage.updateMany(
      {
        room: roomId,
        receiver: user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Reset unread count
    if (room.buyer.toString() === user._id.toString()) {
      room.unreadCountBuyer = 0;
    } else {
      room.unreadCountSeller = 0;
    }
    await room.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark as read" },
      { status: 500 }
    );
  }
}

