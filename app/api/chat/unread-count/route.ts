import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Get all rooms where user is buyer or seller
    const rooms = await ChatRoom.find({
      $or: [{ buyer: user._id }, { seller: user._id }],
      isActive: true,
    }).lean();

    let totalUnread = 0;
    rooms.forEach((room: any) => {
      const isBuyer = room.buyer.toString() === user._id.toString();
      totalUnread += isBuyer ? room.unreadCountBuyer : room.unreadCountSeller;
    });

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}

