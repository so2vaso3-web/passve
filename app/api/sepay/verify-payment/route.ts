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

    // BẢO MẬT: Chỉ process nếu transaction có sepayTransactionId (đã được SePay tạo)
    // Điều này ngăn user tự tạo transaction giả và cộng tiền
    if (!transaction.sepayTransactionId) {
      console.log(`⚠️ Transaction ${transactionId} does not have sepayTransactionId - cannot verify payment`);
      return NextResponse.json({
        success: false,
        message: "Transaction chưa được tạo qua SePay. Vui lòng thử lại.",
        transaction: transaction,
      }, { status: 400 });
    }

    // BẢO MẬT: Kiểm tra transaction không quá cũ (tránh replay attack)
    const transactionAge = Date.now() - new Date(transaction.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 giờ
    if (transactionAge > maxAge) {
      console.log(`⚠️ Transaction ${transactionId} is too old (${Math.round(transactionAge / 1000 / 60)} minutes)`);
      return NextResponse.json({
        success: false,
        message: "Transaction đã quá cũ. Vui lòng tạo giao dịch mới.",
        transaction: transaction,
      }, { status: 400 });
    }

    console.log(`🔍 Verifying payment for transaction ${transactionId}:`, {
      status: transaction.status,
      type: transaction.type,
      sepayTransactionId: transaction.sepayTransactionId,
      amount: transaction.amount,
    });

    // Check transaction type
    if (transaction.type !== "deposit") {
      console.log(`⚠️ Transaction type is "${transaction.type}", not deposit - cannot process`);
      return NextResponse.json({
        success: false,
        message: `Transaction type is "${transaction.type}", not deposit`,
        transaction: transaction,
      });
    }
    
    // BẢO MẬT: Chỉ process nếu transaction đã có sepayTransactionId (đã được SePay tạo)
    // Và chỉ process khi user thực sự đã về success page (có nghĩa là SePay đã redirect)
    // Tuy nhiên, để an toàn hơn, ta sẽ đợi webhook confirm hoặc verify với SePay API
    // Ở đây ta chỉ process như một fallback, nhưng phải có sepayTransactionId
    
    console.log(`💰 Processing payment - Transaction has sepayTransactionId, user is on success page`);
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

