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

    // Get request body to check if admin cancel
    const body = await request.json().catch(() => ({}));
    const isAdminCancel = body.adminCancel === true;

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

    // Kiểm tra quyền - lấy buyerId một lần
    const buyerIdString = (ticket.buyer as any)?._id?.toString() || ticket.buyer?.toString();
    const isBuyer = buyerIdString === user._id.toString();
    const isAdmin = user.role === "admin";

    // Nếu là admin cancel, chỉ admin mới được làm
    if (isAdminCancel && !isAdmin) {
      return NextResponse.json(
        { error: "Chỉ admin mới có quyền hủy vé sau thời gian giới hạn" },
        { status: 403 }
      );
    }

    if (!isBuyer && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền hủy vé này" },
        { status: 403 }
      );
    }

    // Kiểm tra thời gian - lấy thời gian giới hạn từ settings
    // Chỉ kiểm tra thời gian nếu không phải admin cancel
    if (!isAdminCancel) {
      const { getSiteSettings } = await import("@/models/SiteSettings");
      const settings = await getSiteSettings();
      const timeLimitMinutes = settings?.cancellationTimeLimitMinutes || 5;
      
      const soldAt = ticket.soldAt || ticket.createdAt;
      const minutesSincePurchase = (Date.now() - new Date(soldAt).getTime()) / (1000 * 60);
      
      if (minutesSincePurchase > timeLimitMinutes && !isAdmin) {
        const timeElapsed = Math.floor(minutesSincePurchase);
        return NextResponse.json(
          { 
            error: `Đã quá ${timeLimitMinutes} phút, không thể hủy vé. Thời gian đã trôi qua: ${timeElapsed} phút.`,
            timeLimit: timeLimitMinutes,
            timeElapsed: timeElapsed,
          },
          { status: 400 }
        );
      }
    }

    // Tính toán số tiền hoàn lại
    // totalPaid = số tiền người mua đã trả (giá vé + 7% phí)
    const buyerFee = Math.round(ticket.sellingPrice * 0.07);
    const totalPaid = ticket.sellingPrice + buyerFee;
    // sellerReceives = số tiền người bán đã nhận (giá vé - 7% phí)
    const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

    // Get wallets - đảm bảo buyerId là ObjectId
    const mongoose = await import("mongoose");
    const buyerIdForWallet = (ticket.buyer as any)?._id 
      ? new mongoose.Types.ObjectId((ticket.buyer as any)._id.toString())
      : new mongoose.Types.ObjectId(ticket.buyer.toString());
    
    let buyerWallet = await Wallet.findOne({ user: buyerIdForWallet });
    if (!buyerWallet) {
      buyerWallet = await Wallet.create({
        user: buyerIdForWallet,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    const sellerId = new mongoose.Types.ObjectId(ticket.seller._id.toString());
    let sellerWallet = await Wallet.findOne({ user: sellerId });
    if (!sellerWallet) {
      sellerWallet = await Wallet.create({
        user: sellerId,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    // Use MongoDB transaction
    const db = mongoose.connection;
    const dbSession = await db.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // ===== HOÀN TIỀN CHO NGƯỜI MUA (BUYER) =====
        // Người mua đã trả totalPaid, cần hoàn lại toàn bộ
        buyerWallet.balance += totalPaid;
        await buyerWallet.save({ session: dbSession });

        // ===== TRỪ TIỀN TỪ NGƯỜI BÁN (SELLER) =====
        // Người bán đã nhận sellerReceives, cần trừ lại
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

        // Cập nhật ticket - trở về trạng thái approved để có thể bán lại
        // Dùng updateOne với $unset để xóa buyer và soldAt
        await Ticket.updateOne(
          { _id: ticket._id },
          {
            $set: { status: "approved" },
            $unset: { buyer: "", soldAt: "" },
          },
          { session: dbSession }
        );

        // ===== TẠO TRANSACTION CHO NGƯỜI MUA (BUYER) =====
        // Ghi lại giao dịch hoàn tiền cho người mua
        const transactionData = {
          user: buyerIdForWallet, // Người mua nhận tiền hoàn lại
          type: "refund" as const,
          amount: totalPaid, // Số tiền hoàn lại cho người mua
          status: "completed" as const,
          description: `Hoàn tiền vé ${ticket.movieTitle || "N/A"} - ${ticket.cinema || "N/A"} (Hủy vé)`,
          ticket: ticket._id,
        };

        // Validate trước khi tạo
        if (!transactionData.user || !transactionData.type || !transactionData.amount || !transactionData.description) {
          throw new Error("Missing required transaction fields");
        }

        await Transaction.create([transactionData], { session: dbSession, ordered: true });
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
