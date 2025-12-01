import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: "Số tiền tối thiểu là 10,000 VNĐ" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please configure MongoDB." },
        { status: 503 }
      );
    }

    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Tạo transaction
    const transaction = await Transaction.create({
      user: dbUser._id,
      type: "deposit",
      amount,
      paymentMethod: method,
      status: method === "bank" ? "pending" : "completed",
      description: `Nạp tiền ${new Intl.NumberFormat("vi-VN").format(amount)} đ qua ${method}`,
      bankAccount: bankAccount || undefined,
    });

    // Nếu là chuyển khoản, chờ admin duyệt. Nếu là payment gateway, cộng tiền ngay
    if (method !== "bank") {
      let wallet = await Wallet.findOne({ user: dbUser._id });
      if (!wallet) {
        wallet = await Wallet.create({ user: dbUser._id, balance: amount });
      } else {
        wallet.balance += amount;
        await wallet.save();
      }

      await Transaction.findByIdAndUpdate(transaction._id, { status: "completed" });
    }

    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");
    if (method !== "bank") {
      revalidateTag("stats");
    }

    // Trả về payment URL nếu là payment gateway (mock)
    if (method !== "bank_transfer") {
      return NextResponse.json({
        success: true,
        transactionId: transaction._id,
        paymentUrl: `/payment/${transaction._id}`, // Mock URL
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction._id,
      message: "Yêu cầu nạp tiền đã được gửi. Admin sẽ xác nhận trong vòng 24h.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

