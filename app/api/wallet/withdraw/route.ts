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
    const { amount, bankAccountId } = body;

    if (!amount || amount <= 50000) {
      return NextResponse.json(
        { error: "Số tiền phải lớn hơn 50,000 VNĐ" },
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

    let wallet = await Wallet.findOne({ user: dbUser._id }).maxTimeMS(5000);
    if (!wallet) {
      wallet = await Wallet.create({ user: dbUser._id });
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Số dư không đủ" },
        { status: 400 }
      );
    }

    const bankAccount = (dbUser.bankAccounts || []).find(
      (acc: any) => acc._id?.toString() === bankAccountId || acc.accountNumber === bankAccountId
    );

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Tài khoản ngân hàng không tồn tại" },
        { status: 400 }
      );
    }

    // Trừ tiền tạm thời (giữ escrow)
    wallet.balance -= amount;
    await wallet.save();

    // Tạo transaction
    await Transaction.create({
      user: dbUser._id,
      type: "withdraw",
      amount,
      method: "bank_withdraw",
      status: "pending",
      description: `Rút tiền ${new Intl.NumberFormat("vi-VN").format(amount)} đ về ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
      bankAccount: bankAccountId,
    });

    revalidatePath("/profile");
    revalidatePath("/admin/withdrawals");
    revalidateTag("wallet");
    revalidateTag("transactions");

    return NextResponse.json({
      success: true,
      message: "Yêu cầu rút tiền đã được gửi. Admin sẽ duyệt trong vòng 24h.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

