import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

// API để tự động fix các vé on_hold có QR image hoặc ticketCode
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Chỉ admin mới được chạy script này
    const User = (await import("@/models/User")).default;
    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email }).select("role").lean();
    
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = (await import("mongoose")).connection;
    const dbSession = await db.startSession();

    try {
      let fixedCount = 0;

      await dbSession.withTransaction(async () => {
        // Tìm tất cả vé on_hold có qrImage hoặc ticketCode
        const tickets = await Ticket.find({
          status: "on_hold",
          $or: [
            { qrImage: { $exists: true, $ne: null, $ne: "" } },
            { ticketCode: { $exists: true, $ne: null, $ne: "" } },
          ],
        })
          .populate("seller onHoldBy")
          .session(dbSession);

        for (const ticket of tickets) {
          const hasQrImage = ticket.qrImage && String(ticket.qrImage).trim().length > 0;
          const hasTicketCode = ticket.ticketCode && String(ticket.ticketCode).trim().length > 0;

          if (!hasQrImage && !hasTicketCode) {
            continue;
          }

          // Tính toán số tiền
          const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

          // Lấy wallet của seller
          let sellerWallet = await Wallet.findOne({ user: ticket.seller._id }).session(dbSession);
          if (!sellerWallet) {
            sellerWallet = await Wallet.create(
              [
                {
                  user: ticket.seller._id,
                  balance: 0,
                  escrow: 0,
                  totalEarned: 0,
                },
              ],
              { session: dbSession }
            )[0];
          }

          // Chuyển từ escrow sang balance
          if (sellerWallet.escrow >= ticket.sellingPrice) {
            sellerWallet.escrow -= ticket.sellingPrice;
            sellerWallet.balance += sellerReceives;
            sellerWallet.totalEarned += sellerReceives;
            await sellerWallet.save({ session: dbSession });
          }

          // Cập nhật ticket status
          ticket.status = "sold";
          ticket.buyer = ticket.onHoldBy;
          ticket.soldAt = ticket.onHoldAt || new Date();
          await ticket.save({ session: dbSession });

          // Tạo transaction mới
          const buyer = ticket.onHoldBy;
          if (buyer) {
            const buyerFee = Math.round(ticket.sellingPrice * 0.07);
            const total = ticket.sellingPrice + buyerFee;

            await Transaction.create(
              [
                {
                  user: buyer._id,
                  type: "purchase",
                  amount: total,
                  status: "completed",
                  description: `Mua vé ${ticket.movieTitle} - ${ticket.cinema}${hasTicketCode ? ` (Mã vé: ${ticket.ticketCode})` : ""}`,
                  ticket: ticket._id,
                },
                {
                  user: ticket.seller._id,
                  type: "sale",
                  amount: sellerReceives,
                  status: "completed",
                  description: `Bán vé ${ticket.movieTitle} cho ${(buyer as any).name || "Người mua"}`,
                  ticket: ticket._id,
                },
              ],
              { session: dbSession, ordered: true }
            );
          }

          fixedCount++;
        }
      });

      return NextResponse.json({
        success: true,
        message: `Đã sửa ${fixedCount} vé từ on_hold → sold`,
        fixedCount,
      });
    } finally {
      await dbSession.endSession();
    }
  } catch (error: any) {
    console.error("Error fixing on_hold tickets:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

