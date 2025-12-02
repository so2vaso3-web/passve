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

    // Giả định rằng nếu user về success page, payment đã thành công
    // Vì SePay chỉ redirect về success_url khi payment thành công
    // Nếu status là pending và type là deposit, ta sẽ tự động process
    if ((transaction.status as string) === "pending" && transaction.type === "deposit") {
      console.log(`💰 Processing payment manually (webhook may not have fired)`);
      console.log(`📊 Transaction details:`, {
        id: transaction._id,
        userId: transaction.user,
        amount: transaction.amount,
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
          console.log(`✅ New wallet created with balance: ${wallet.balance}`);
        } else {
          const oldBalance = wallet.balance;
          wallet.balance += transaction.amount;
          await wallet.save();
          console.log(`💵 Wallet updated: ${oldBalance} → ${wallet.balance}`);
        }

        // Cập nhật transaction status - đảm bảo dùng lean() để tránh lỗi
        const updateResult = await Transaction.findByIdAndUpdate(
          transaction._id,
          {
            status: "completed",
            completedAt: new Date(),
          },
          { new: true }
        );

        if (!updateResult) {
          console.error(`❌ Failed to update transaction ${transactionId}`);
          throw new Error("Failed to update transaction status");
        }

        console.log(`✅ Transaction status updated to completed: ${transactionId}`);

        // Reload transaction để return
        const updatedTransaction = await Transaction.findById(transactionId).maxTimeMS(10000).lean();

        // Revalidate cache
        revalidatePath("/profile");
        revalidatePath("/payment/success");
        revalidateTag("wallet");
        revalidateTag("transactions");
        revalidateTag("stats");

        console.log(`🎉 Payment successfully processed: Transaction ${transactionId}, Amount: ${transaction.amount}`);

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          transaction: updatedTransaction,
        });
      } catch (processError: any) {
        console.error(`❌ Error processing payment for transaction ${transactionId}:`, processError);
        return NextResponse.json(
          { 
            success: false,
            error: processError.message || "Failed to process payment",
            message: "Error processing payment, please contact support",
          },
          { status: 500 }
        );
      }
    } else if ((transaction.status as string) === "completed") {
      console.log(`✅ Transaction ${transactionId} already completed`);
      return NextResponse.json({
        success: true,
        message: "Transaction already completed",
        transaction: transaction,
      });
    }

    // Nếu transaction không phải pending hoặc không phải deposit, 
    // nhưng user đã về success page => payment đã thành công
    // Ta vẫn process để đảm bảo tiền được cộng
    if ((transaction.status as string) !== "pending") {
      console.log(`⚠️ Transaction status is "${transaction.status}", but user is on success page. Processing anyway...`);
    }
    
    // Nếu type không phải deposit, không xử lý
    if (transaction.type !== "deposit") {
      return NextResponse.json({
        success: false,
        message: `Transaction type is "${transaction.type}", not deposit`,
        transaction: transaction,
      });
    }
    
    // Nếu đã completed, return success
    if ((transaction.status as string) === "completed") {
      return NextResponse.json({
        success: true,
        message: "Transaction already completed",
        transaction: transaction,
      });
    }
    
    // Force process payment vì user đã về success page = payment thành công
    console.log(`💰 FORCE Processing payment - User is on success page, payment must have succeeded`);
    
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
        console.log(`✅ New wallet created with balance: ${wallet.balance}`);
      } else {
        const oldBalance = wallet.balance;
        wallet.balance += transaction.amount;
        await wallet.save();
        console.log(`💵 Wallet updated: ${oldBalance} → ${wallet.balance}`);
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
        console.error(`❌ Failed to update transaction ${transactionId}`);
        throw new Error("Failed to update transaction status");
      }

      console.log(`✅ Transaction status updated to completed: ${transactionId}`);

      // Reload transaction để return
      const updatedTransaction = await Transaction.findById(transactionId).maxTimeMS(10000).lean();

      // Revalidate cache
      revalidatePath("/profile");
      revalidatePath("/payment/success");
      revalidateTag("wallet");
      revalidateTag("transactions");
      revalidateTag("stats");

      console.log(`🎉 Payment successfully processed: Transaction ${transactionId}, Amount: ${transaction.amount}`);

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        transaction: updatedTransaction,
      });
    } catch (processError: any) {
      console.error(`❌ Error processing payment for transaction ${transactionId}:`, processError);
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

