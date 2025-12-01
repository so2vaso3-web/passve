import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, sellerId } = await request.json();

    if (!ticketId || !sellerId) {
      return NextResponse.json(
        { error: "Missing ticketId or sellerId" },
        { status: 400 }
      );
    }

    await connectDB();

    const buyer = await User.findOne({ email: session.user.email });
    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Tìm room đã tồn tại giữa buyer và seller (không cần ticket)
    // Mỗi cặp buyer-seller chỉ có 1 room duy nhất
    // Tìm theo buyer là người hiện tại (người mua)
    let room = await ChatRoom.findOne({
      buyer: buyer._id,
      seller: sellerId,
      isActive: true,
    });

    // Nếu chưa có, thử tìm ngược lại (trường hợp buyer-seller bị đảo)
    if (!room) {
      room = await ChatRoom.findOne({
        buyer: sellerId,
        seller: buyer._id,
        isActive: true,
      });
      
      // Nếu tìm thấy nhưng buyer-seller bị đảo, đảo lại cho đúng
      if (room) {
        // Swap buyer và seller
        const temp = room.buyer;
        room.buyer = room.seller;
        room.seller = temp;
        await room.save();
      }
    }

    // Nếu đã có room, update ticket reference nếu khác
    if (room) {
      if (room.ticket.toString() !== ticketId.toString()) {
        room.ticket = ticketId;
        await room.save();
      }
    } else {
      // Nếu chưa có, tạo mới - buyer là người mua, seller là người bán
      room = await ChatRoom.create({
        ticket: ticketId,
        buyer: buyer._id,  // Người mua
        seller: sellerId,  // Người bán
        unreadCountBuyer: 0,
        unreadCountSeller: 0,
        isActive: true,
      });
    }

    return NextResponse.json({
      roomId: room._id.toString(),
      room: {
        id: room._id.toString(),
        ticket: ticketId,
        buyer: buyer._id.toString(),
        seller: sellerId,
      },
    });
  } catch (error: any) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
