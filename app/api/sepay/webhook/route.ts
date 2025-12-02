import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// Webhook nhận callback từ SePay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transaction_id,
      order_id,
      order_invoice_number,
      va_number,
      amount,
      status,
      signature,
      // Các field khác từ SePay webhook/IPN
    } = body;

    // Verify signature (tùy theo cách SePay implement)
    const SEPAY_SECRET_KEY = process.env.SEPAY_SECRET_KEY;
    if (!SEPAY_SECRET_KEY) {
      console.error("SePay secret not configured");
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // TODO: Verify signature theo cách SePay yêu cầu
    // const expectedSignature = createSignature(body, SEPAY_SECRET);
    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    // Tìm transaction bằng sepayTransactionId (order_invoice_number) trước
    // vì đó là giá trị chính xác nhất ta lưu khi tạo payment
    let transaction = null;
    
    if (order_invoice_number) {
      transaction = await Transaction.findOne({
        sepayTransactionId: order_invoice_number,
      }).maxTimeMS(5000);
    }
    
    // Nếu không tìm thấy, thử tìm theo transaction_id hoặc order_id
    if (!transaction && transaction_id) {
      transaction = await Transaction.findOne({
        sepayTransactionId: transaction_id,
      }).maxTimeMS(5000);
    }
    
    // Nếu vẫn không tìm thấy, thử tìm theo order_id (có thể là transaction._id)
    if (!transaction && order_id) {
      try {
        transaction = await Transaction.findById(order_id).maxTimeMS(5000);
      } catch (e) {
        // order_id có thể không phải ObjectId hợp lệ
      }
    }

    if (!transaction) {
      console.error("Transaction not found. Search params:", {
        order_invoice_number,
        transaction_id,
        order_id,
        amount,
        status,
      });
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Nếu đã xử lý rồi, return success
    if (transaction.status === "completed") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Xử lý theo status từ SePay
    if (status === "success" || status === "completed" || status === "paid") {
      // Chỉ xử lý nếu transaction chưa completed (double check để tránh duplicate)
      const currentStatus = transaction.status as string;
      if (currentStatus !== "completed") {
        // Use amount from webhook or transaction
        const depositAmount = amount || transaction.amount;
        
        // Cộng tiền vào ví
        let wallet = await Wallet.findOne({ user: transaction.user }).maxTimeMS(5000);
        if (!wallet) {
          wallet = await Wallet.create({
            user: transaction.user,
            balance: depositAmount,
            escrow: 0,
            totalEarned: 0,
          });
        } else {
          wallet.balance += depositAmount;
          await wallet.save();
        }

        // Cập nhật transaction
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: "completed",
          sepayTransactionId: transaction_id || order_invoice_number || transaction.sepayTransactionId,
          completedAt: new Date(),
        });

        console.log(`✅ Payment processed: Transaction ${transaction._id}, Amount: ${depositAmount}, User: ${transaction.user}`);
      }

      // Revalidate cache
      revalidatePath("/profile");
      revalidateTag("wallet");
      revalidateTag("transactions");
      revalidateTag("stats");

      return NextResponse.json({ success: true, message: "Payment processed" });
    } else if (status === "failed" || status === "cancelled" || status === "expired") {
      // Cập nhật transaction failed
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "failed",
        sepayTransactionId: transaction_id,
        errorMessage: `Payment ${status}`,
      });

      return NextResponse.json({ success: true, message: "Payment failed" });
    }

    // Status khác (pending, processing...)
    return NextResponse.json({ success: true, message: "Payment pending" });
  } catch (error: any) {
    console.error("SePay webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

