import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import ChatMessage from "@/models/ChatMessage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

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

    // Verify user is part of this room
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

    const messages = await ChatMessage.find({ room: roomId })
      .populate("sender", "name image")
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((msg: any) => ({
      _id: msg._id.toString(),
      sender: msg.sender._id.toString(),
      senderName: msg.sender.name,
      message: msg.message,
      type: msg.type,
      attachments: msg.attachments || [],
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, message, receiverId, type = "text", attachments = [] } = await request.json();

    if (!roomId || !message || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const sender = await User.findOne({ email: session.user.email });
    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (
      room.buyer.toString() !== sender._id.toString() &&
      room.seller.toString() !== sender._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create message
    const newMessage = await ChatMessage.create({
      room: roomId,
      sender: sender._id,
      receiver: receiverId,
      message: message.trim(),
      type,
      attachments,
      isRead: false,
    });

    // Update room
    room.lastMessage = message.trim();
    room.lastMessageAt = new Date();
    if (room.buyer.toString() === sender._id.toString()) {
      room.unreadCountSeller += 1;
    } else {
      room.unreadCountBuyer += 1;
    }
    await room.save();

    // Revalidate tags for real-time updates
    const { revalidateTag } = await import("next/cache");
    revalidateTag("chat");
    revalidateTag("unread-count");

    // Populate sender
    await newMessage.populate("sender", "name image");

    return NextResponse.json({
      success: true,
      message: {
        _id: newMessage._id.toString(),
        sender: newMessage.sender._id.toString(),
        senderName: (newMessage.sender as any).name,
        message: newMessage.message,
        type: newMessage.type,
        attachments: newMessage.attachments || [],
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
