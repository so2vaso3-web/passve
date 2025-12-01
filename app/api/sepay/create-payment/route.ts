import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { SePayPgClient } from "sepay-pg-node";

export const dynamic = "force-dynamic";

// Tạo payment link qua SePay
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: "Số tiền tối thiểu là 10,000 VNĐ" },
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

    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Tạo transaction pending
    const transaction = await Transaction.create({
      user: dbUser._id,
      type: "deposit",
      amount,
      method: "sepay",
      status: "pending",
      description: description || `Nạp tiền ${new Intl.NumberFormat("vi-VN").format(amount)} đ qua SePay`,
    });

    // Lấy SePay config từ env
    const SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID; // SP-TEST-XXXXXXXX
    const SEPAY_SECRET_KEY = process.env.SEPAY_SECRET_KEY; // spsk_test_xxxxxxxxxx
    const SEPAY_ENV = process.env.SEPAY_ENV || "sandbox"; // sandbox hoặc production

    if (!SEPAY_MERCHANT_ID || !SEPAY_SECRET_KEY) {
      return NextResponse.json(
        { error: "SePay chưa được cấu hình. Vui lòng liên hệ admin." },
        { status: 500 }
      );
    }

    // Khởi tạo SePay client theo code mẫu
    const client = new SePayPgClient({
      env: SEPAY_ENV as "sandbox" | "production",
      merchant_id: SEPAY_MERCHANT_ID,
      secret_key: SEPAY_SECRET_KEY,
    });

    // Lấy checkout URL
    const checkoutURL = client.checkout.initCheckoutUrl();

    // Tạo checkout form fields theo code mẫu
    const orderInvoiceNumber = `INV-${transaction._id.toString()}-${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const checkoutFormfields = client.checkout.initOneTimePaymentFields({
      payment_method: "BANK_TRANSFER",
      order_invoice_number: orderInvoiceNumber,
      order_amount: amount,
      currency: "VND",
      order_description: description || `Nạp tiền ${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`,
      success_url: `${baseUrl}/payment/success?transactionId=${transaction._id}`,
      error_url: `${baseUrl}/payment/cancel?transactionId=${transaction._id}`,
      cancel_url: `${baseUrl}/payment/cancel?transactionId=${transaction._id}`,
    });

    // Lưu order invoice number
    await Transaction.findByIdAndUpdate(transaction._id, {
      sepayTransactionId: orderInvoiceNumber,
      sepayPaymentUrl: checkoutURL,
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction._id,
      checkoutUrl: checkoutURL,
      checkoutFormfields: checkoutFormfields,
      orderInvoiceNumber: orderInvoiceNumber,
      amount: amount,
    });
  } catch (error: any) {
    console.error("SePay create payment error:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi tạo payment" },
      { status: 500 }
    );
  }
}

