import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ChatMessage from "@/models/Chat";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const messages = await ChatMessage.find({
      ticket: params.ticketId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      messages: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
        sender: msg.sender.toString(),
        receiver: msg.receiver.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { receiverId, message } = await request.json();

    const chatMessage = await ChatMessage.create({
      ticket: params.ticketId,
      sender: user._id,
      receiver: receiverId,
      message,
    });

    return NextResponse.json({
      message: {
        ...chatMessage.toObject(),
        _id: chatMessage._id.toString(),
        sender: chatMessage.sender.toString(),
        receiver: chatMessage.receiver.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

