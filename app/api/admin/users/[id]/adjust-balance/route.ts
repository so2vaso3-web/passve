import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, description } = body; // type: "add" | "subtract"

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    if (!type || !["add", "subtract"].includes(type)) {
      return NextResponse.json({ error: "Loại thao tác không hợp lệ" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: params.id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: params.id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
    }

    // Adjust balance
    if (type === "add") {
      wallet.balance += amount;
    } else {
      if (wallet.balance < amount) {
        return NextResponse.json(
          { error: `Số dư không đủ. Số dư hiện tại: ${wallet.balance.toLocaleString("vi-VN")} đ` },
          { status: 400 }
        );
      }
      wallet.balance -= amount;
    }

    await wallet.save();

    // Create transaction record
    await Transaction.create({
      user: params.id,
      type: type === "add" ? "deposit" : "withdraw",
      amount: amount,
      status: "completed",
      method: "bank_transfer",
      description: description || `Admin ${type === "add" ? "cộng" : "trừ"} tiền: ${description || "Điều chỉnh số dư"}`,
      adminNote: `Admin ${type === "add" ? "cộng" : "trừ"} ${amount.toLocaleString("vi-VN")} đ`,
      completedAt: new Date(),
    });

    revalidatePath("/admin/users");
    revalidateTag("wallet");

    return NextResponse.json({
      success: true,
      message: `Đã ${type === "add" ? "cộng" : "trừ"} ${amount.toLocaleString("vi-VN")} đ thành công`,
      wallet: {
        balance: wallet.balance,
        escrow: wallet.escrow,
        totalEarned: wallet.totalEarned,
      },
    });
  } catch (error: any) {
    console.error("Error adjusting balance:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

