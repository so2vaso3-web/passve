import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// API để verify và process payment khi user về success page
// Này là backup nếu webhook chưa chạy
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 503 }
      );
    }

    // Lấy transaction
    const transaction = await Transaction.findById(transactionId).maxTimeMS(5000);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser || transaction.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Nếu đã completed rồi, return success
    if (transaction.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        transaction: transaction,
      });
    }

    // Nếu transaction có sepayTransactionId, có thể đã được SePay xử lý
    // Nhưng webhook chưa cập nhật, nên ta tự cộng tiền
    // Lưu ý: Đây là fallback, webhook vẫn là cách chính xác nhất

    // Giả định rằng nếu user về success page, payment đã thành công
    // Vì SePay chỉ redirect về success_url khi payment thành công
    if (transaction.status === "pending" && transaction.type === "deposit") {
      // Cộng tiền vào ví
      let wallet = await Wallet.findOne({ user: transaction.user }).maxTimeMS(5000);
      if (!wallet) {
        wallet = await Wallet.create({
          user: transaction.user,
          balance: transaction.amount,
          escrow: 0,
          totalEarned: 0,
        });
      } else {
        wallet.balance += transaction.amount;
        await wallet.save();
      }

      // Cập nhật transaction
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "completed",
        completedAt: new Date(),
      });

      // Reload transaction để return
      const updatedTransaction = await Transaction.findById(transactionId).maxTimeMS(5000);

      // Revalidate cache
      revalidatePath("/profile");
      revalidatePath("/payment/success");
      revalidateTag("wallet");
      revalidateTag("transactions");
      revalidateTag("stats");

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        transaction: updatedTransaction,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Transaction status is not pending",
      transaction: transaction,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

