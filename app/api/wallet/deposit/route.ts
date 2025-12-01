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
      method: method || "sepay",
      status: "pending",
      description: `Nạp tiền ${new Intl.NumberFormat("vi-VN").format(amount)} đ qua ${method || "sepay"}`,
    });

    // API này không còn được sử dụng cho nạp tiền tự động
    // DepositForm giờ gọi trực tiếp /api/sepay/create-payment
    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");

    return NextResponse.json({
      success: true,
      transactionId: transaction._id,
      message: "API này không còn được sử dụng. Vui lòng dùng SePay.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

