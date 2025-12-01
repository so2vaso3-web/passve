import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để mua vé" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get buyer
    const buyer = await User.findOne({ email: session.user.email });
    if (!buyer) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 404 }
      );
    }

    // Get ticket
    const ticket = await Ticket.findById(params.id).populate("seller");
    if (!ticket) {
      return NextResponse.json(
        { error: "Không tìm thấy vé" },
        { status: 404 }
      );
    }

    // Check if ticket is available
    if (ticket.status !== "approved") {
      return NextResponse.json(
        { error: "Vé không còn khả dụng" },
        { status: 400 }
      );
    }

    // Check if buyer is seller
    if (ticket.seller._id.toString() === buyer._id.toString()) {
      return NextResponse.json(
        { error: "Bạn không thể mua vé của chính mình" },
        { status: 400 }
      );
    }

    // Check if expired
    if (ticket.isExpired || new Date(ticket.expireAt) < new Date()) {
      return NextResponse.json(
        { error: "Vé đã hết hạn" },
        { status: 400 }
      );
    }

    // Calculate amounts
    // Buyer pays: sellingPrice + 7% fee
    const buyerFee = Math.round(ticket.sellingPrice * 0.07);
    const total = ticket.sellingPrice + buyerFee;
    
    // Seller receives: sellingPrice - 7% fee (will be deducted on escrow release)
    const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

    // Get buyer wallet
    let buyerWallet = await Wallet.findOne({ user: buyer._id });
    if (!buyerWallet) {
      buyerWallet = await Wallet.create({
        user: buyer._id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    // Check balance
    if (buyerWallet.balance < total) {
      return NextResponse.json(
        {
          error: `Số dư không đủ! Cần ${total.toLocaleString("vi-VN")} đ, hiện có ${buyerWallet.balance.toLocaleString("vi-VN")} đ`,
        },
        { status: 400 }
      );
    }

    // Get seller wallet
    let sellerWallet = await Wallet.findOne({ user: ticket.seller._id });
    if (!sellerWallet) {
      sellerWallet = await Wallet.create({
        user: ticket.seller._id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    // Start transaction
    const session_db = await connectDB();
    if (!session_db) {
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Use MongoDB transaction for atomicity
    const db = (await import("mongoose")).connection;
    const dbSession = await db.startSession();
    
    // Check if ticket has code - if yes, auto-complete sale
    const hasTicketCode = ticket.ticketCode && ticket.ticketCode.trim().length > 0;
    
    try {
      await dbSession.withTransaction(async () => {
        // Deduct from buyer balance
        buyerWallet.balance -= total;
        await buyerWallet.save({ session: dbSession });

        if (hasTicketCode) {
          // If ticket has code, complete sale immediately
          // Seller receives money (minus 7% fee)
          sellerWallet.balance += sellerReceives;
          sellerWallet.totalEarned += sellerReceives;
          await sellerWallet.save({ session: dbSession });

          // Update ticket status to sold
          ticket.status = "sold";
          ticket.buyer = buyer._id;
          ticket.soldAt = new Date();
          await ticket.save({ session: dbSession });

          // Create transactions for completed sale
          await Transaction.create(
            [
              {
                user: buyer._id,
                type: "purchase",
                amount: total,
                status: "completed",
                description: `Mua vé ${ticket.movieTitle} - ${ticket.cinema} (Mã vé: ${ticket.ticketCode})`,
                ticket: ticket._id,
              },
              {
                user: ticket.seller._id,
                type: "sale",
                amount: sellerReceives,
                status: "completed",
                description: `Bán vé ${ticket.movieTitle} cho ${buyer.name}`,
                ticket: ticket._id,
              },
            ],
            { session: dbSession, ordered: true }
          );
        } else {
          // If no code, use escrow flow (original flow)
          // Add to seller escrow (full amount, will deduct 7% on release)
          sellerWallet.escrow += ticket.sellingPrice;
          await sellerWallet.save({ session: dbSession });

          // Update ticket status
          ticket.status = "on_hold";
          ticket.onHoldBy = buyer._id;
          ticket.onHoldAt = new Date();
          await ticket.save({ session: dbSession });

          // Create transactions
          await Transaction.create(
            [
              {
                user: buyer._id,
                type: "escrow_hold",
                amount: total,
                status: "completed",
                description: `Giữ vé ${ticket.movieTitle} - ${ticket.cinema}`,
                ticket: ticket._id,
              },
              {
                user: ticket.seller._id,
                type: "escrow_hold",
                amount: ticket.sellingPrice,
                status: "completed",
                description: `Vé ${ticket.movieTitle} được giữ bởi ${buyer.name}`,
                ticket: ticket._id,
              },
            ],
            { session: dbSession, ordered: true }
          );
        }
      });

      // Revalidate
      revalidatePath("/");
      revalidatePath(`/post/${params.id}`);
      revalidatePath("/profile");
      revalidateTag("tickets");
      revalidateTag("wallet");
      revalidateTag("stats");

      return NextResponse.json({
        success: true,
        message: hasTicketCode 
          ? `Đã mua vé thành công! Mã vé: ${ticket.ticketCode}`
          : "Đã giữ vé thành công! Vui lòng thanh toán trong 15 phút",
        ticket: {
          id: ticket._id.toString(),
          status: ticket.status,
          ticketCode: hasTicketCode ? ticket.ticketCode : undefined,
        },
      });
    } finally {
      await dbSession.endSession();
    }
  } catch (error: any) {
    console.error("Error buying ticket:", error);
    return NextResponse.json(
      {
        error: error.message || "Có lỗi xảy ra khi mua vé",
      },
      { status: 500 }
    );
  }
}

