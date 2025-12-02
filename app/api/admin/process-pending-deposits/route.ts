import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// API để admin manually process các pending deposits
// Hoặc để tự động retry các transaction chưa được xử lý
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { transactionId } = body;

    // Nếu có transactionId cụ thể, process transaction đó
    if (transactionId) {
      const transaction = await Transaction.findById(transactionId).maxTimeMS(10000);
      
      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      if (transaction.status !== "pending" || transaction.type !== "deposit") {
        return NextResponse.json({
          success: false,
          message: `Transaction is not pending deposit. Current status: ${transaction.status}`,
          transaction,
        });
      }

      // Process transaction
      let wallet = await Wallet.findOne({ user: transaction.user }).maxTimeMS(10000);
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

      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "completed",
        completedAt: new Date(),
      });

      revalidatePath("/profile");
      revalidateTag("wallet");
      revalidateTag("transactions");

      return NextResponse.json({
        success: true,
        message: "Transaction processed successfully",
        transaction: await Transaction.findById(transactionId),
      });
    }

    // Nếu không có transactionId, process tất cả pending deposits cũ hơn 5 phút
    // (để tránh process các transaction vừa tạo)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const pendingTransactions = await Transaction.find({
      type: "deposit",
      status: "pending",
      createdAt: { $lt: fiveMinutesAgo }, // Chỉ process các transaction cũ hơn 5 phút
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .maxTimeMS(10000);

    console.log(`🔍 Found ${pendingTransactions.length} pending deposits older than 5 minutes`);

    const results = [];
    for (const transaction of pendingTransactions) {
      try {
        // Giả định rằng nếu transaction đã tồn tại hơn 5 phút và vẫn pending,
        // có thể payment đã thành công nhưng webhook chưa được gọi
        // Hoặc user đã thanh toán nhưng chưa được verify
        // Ta sẽ process nó

        let wallet = await Wallet.findOne({ user: transaction.user }).maxTimeMS(10000);
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

        await Transaction.findByIdAndUpdate(transaction._id, {
          status: "completed",
          completedAt: new Date(),
        });

        results.push({
          transactionId: transaction._id.toString(),
          amount: transaction.amount,
          status: "processed",
        });

        console.log(`✅ Processed transaction ${transaction._id}`);
      } catch (error: any) {
        console.error(`❌ Error processing transaction ${transaction._id}:`, error);
        results.push({
          transactionId: transaction._id.toString(),
          amount: transaction.amount,
          status: "error",
          error: error.message,
        });
      }
    }

    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");

    return NextResponse.json({
      success: true,
      message: `Processed ${results.filter(r => r.status === "processed").length} transactions`,
      results,
    });
  } catch (error: any) {
    console.error("Error processing pending deposits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process pending deposits" },
      { status: 500 }
    );
  }
}

