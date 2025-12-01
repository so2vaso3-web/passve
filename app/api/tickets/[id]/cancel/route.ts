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

// POST - Hủy/Trả vé và hoàn tiền
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 404 }
      );
    }

    // Get ticket
    const ticket = await Ticket.findById(params.id).populate("seller buyer");
    if (!ticket) {
      return NextResponse.json(
        { error: "Không tìm thấy vé" },
        { status: 404 }
      );
    }

    // Chỉ người mua mới được hủy vé
    if (ticket.status !== "sold" || !ticket.buyer) {
      return NextResponse.json(
        { error: "Vé này không thể hủy" },
        { status: 400 }
      );
    }

    // Kiểm tra quyền
    const buyerId = (ticket.buyer as any)?._id?.toString() || ticket.buyer?.toString();
    const isBuyer = buyerId === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isBuyer && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền hủy vé này" },
        { status: 403 }
      );
    }

    // Kiểm tra thời gian - chỉ cho phép hủy trong vòng 24h sau khi mua
    const soldAt = ticket.soldAt || ticket.createdAt;
    const hoursSincePurchase = (Date.now() - new Date(soldAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursSincePurchase > 24 && !isAdmin) {
      return NextResponse.json(
        { error: "Chỉ có thể hủy vé trong vòng 24 giờ sau khi mua" },
        { status: 400 }
      );
    }

    // Tính toán số tiền hoàn lại
    const buyerFee = Math.round(ticket.sellingPrice * 0.07);
    const totalPaid = ticket.sellingPrice + buyerFee;
    const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

    // Get wallets
    const buyerId = (ticket.buyer as any)?._id || ticket.buyer;
    let buyerWallet = await Wallet.findOne({ user: buyerId });
    if (!buyerWallet) {
      buyerWallet = await Wallet.create({
        user: buyerId,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    let sellerWallet = await Wallet.findOne({ user: ticket.seller._id });
    if (!sellerWallet) {
      sellerWallet = await Wallet.create({
        user: ticket.seller._id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    // Use MongoDB transaction
    const db = (await import("mongoose")).connection;
    const dbSession = await db.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Hoàn tiền cho buyer (toàn bộ số tiền đã trả)
        buyerWallet.balance += totalPaid;
        await buyerWallet.save({ session: dbSession });

        // Trừ tiền từ seller (số tiền đã nhận)
        if (sellerWallet.balance >= sellerReceives) {
          sellerWallet.balance -= sellerReceives;
          sellerWallet.totalEarned -= sellerReceives;
          await sellerWallet.save({ session: dbSession });
        } else {
          // Nếu seller không đủ tiền, trừ từ escrow hoặc để âm (tùy logic)
          sellerWallet.balance = Math.max(0, sellerWallet.balance - sellerReceives);
          sellerWallet.totalEarned = Math.max(0, sellerWallet.totalEarned - sellerReceives);
          await sellerWallet.save({ session: dbSession });
        }

        // Cập nhật ticket status
        ticket.status = "cancelled";
        await ticket.save({ session: dbSession });

        // Tạo transactions
        const buyerId = (ticket.buyer as any)?._id || ticket.buyer;
        await Transaction.create(
          [
            {
              user: buyerId,
              type: "refund",
              amount: totalPaid,
              status: "completed",
              description: `Hoàn tiền vé ${ticket.movieTitle} - ${ticket.cinema}`,
              ticket: ticket._id,
            },
            {
              user: ticket.seller._id,
              type: "refund",
              amount: -sellerReceives,
              status: "completed",
              description: `Hoàn tiền vé ${ticket.movieTitle} cho ${(ticket.buyer as any)?.name || "Người mua"}`,
              ticket: ticket._id,
            },
          ],
          { session: dbSession, ordered: true }
        );
      });

      // Revalidate
      revalidatePath("/");
      revalidatePath("/profile");
      revalidatePath(`/tickets/${params.id}`);
      revalidateTag("tickets");
      revalidateTag("wallet");
      revalidateTag("stats");

      return NextResponse.json({
        success: true,
        message: "Đã hủy vé và hoàn tiền thành công",
      });
    } finally {
      await dbSession.endSession();
    }
  } catch (error: any) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json(
      {
        error: error.message || "Có lỗi xảy ra khi hủy vé",
      },
      { status: 500 }
    );
  }
}

