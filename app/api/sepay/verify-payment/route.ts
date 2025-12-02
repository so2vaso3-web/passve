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
    if ((transaction.status as string) === "completed") {
      console.log(`✅ Transaction ${transactionId} already completed - returning success`);
      return NextResponse.json({
        success: true,
        message: "Already processed",
        transaction: transaction,
      });
    }

    // Nếu transaction có sepayTransactionId, có thể đã được SePay xử lý
    // Nhưng webhook chưa cập nhật, nên ta tự cộng tiền
    // Lưu ý: Đây là fallback, webhook vẫn là cách chính xác nhất

    console.log(`🔍 Verifying payment for transaction ${transactionId}:`, {
      status: transaction.status,
      type: transaction.type,
      sepayTransactionId: transaction.sepayTransactionId,
      amount: transaction.amount,
    });

    // QUAN TRỌNG: Nếu user đã về success page = SePay đã confirm payment thành công
    // Vì SePay chỉ redirect về success_url khi payment thành công
    // Vậy ta PHẢI process payment ngay, không cần check gì thêm
    
    // Check transaction type
    if (transaction.type !== "deposit") {
      console.log(`⚠️ Transaction type is "${transaction.type}", not deposit - cannot process`);
      return NextResponse.json({
        success: false,
        message: `Transaction type is "${transaction.type}", not deposit`,
        transaction: transaction,
      });
    }
    
    // Nếu đã completed rồi, return success (đã check ở trên rồi, nhưng để an toàn)
    if ((transaction.status as string) === "completed") {
      console.log(`✅ Transaction ${transactionId} already completed - returning success`);
      return NextResponse.json({
        success: true,
        message: "Transaction already completed",
        transaction: transaction,
      });
    }
    
    // FORCE PROCESS PAYMENT - User đã về success page = payment thành công
    console.log(`💰💰💰 FORCE Processing payment - User is on success page, payment MUST have succeeded`);
    console.log(`📊 Transaction details:`, {
      id: transaction._id,
      userId: transaction.user,
      amount: transaction.amount,
      currentStatus: transaction.status,
      sepayTransactionId: transaction.sepayTransactionId,
    });
    
    try {
      // Cộng tiền vào ví
      let wallet = await Wallet.findOne({ user: transaction.user }).maxTimeMS(10000);
      if (!wallet) {
        console.log(`📝 Creating new wallet for user ${transaction.user}`);
        wallet = await Wallet.create({
          user: transaction.user,
          balance: transaction.amount,
          escrow: 0,
          totalEarned: 0,
        });
        console.log(`✅✅✅ New wallet created with balance: ${wallet.balance} VND`);
      } else {
        const oldBalance = wallet.balance;
        wallet.balance += transaction.amount;
        await wallet.save();
        console.log(`💵💵💵 Wallet updated: ${oldBalance} → ${wallet.balance} VND (Added: ${transaction.amount} VND)`);
      }

      // Cập nhật transaction status
      const updateResult = await Transaction.findByIdAndUpdate(
        transaction._id,
        {
          status: "completed",
          completedAt: new Date(),
        },
        { new: true }
      );

      if (!updateResult) {
        console.error(`❌❌❌ CRITICAL: Failed to update transaction ${transactionId} to completed`);
        throw new Error("Failed to update transaction status");
      }

      console.log(`✅✅✅ Transaction status updated to COMPLETED: ${transactionId}`);

      // Reload transaction để return
      const updatedTransaction = await Transaction.findById(transactionId).maxTimeMS(10000).lean();

      // Revalidate cache để frontend cập nhật ngay
      revalidatePath("/profile");
      revalidatePath("/payment/success");
      revalidateTag("wallet");
      revalidateTag("transactions");
      revalidateTag("stats");

      console.log(`🎉🎉🎉 SUCCESS: Payment processed! Transaction ${transactionId}, Amount: ${transaction.amount} VND`);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        transaction: updatedTransaction,
      });
    } catch (processError: any) {
      console.error(`❌❌❌ CRITICAL ERROR processing payment for transaction ${transactionId}:`, processError);
      console.error(`Error stack:`, processError.stack);
      return NextResponse.json(
        { 
          success: false,
          error: processError.message || "Failed to process payment",
          message: "Error processing payment, please contact support",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

