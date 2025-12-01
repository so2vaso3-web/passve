import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";

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
    const { reason } = body;

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction || transaction.type !== "withdraw") {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "pending") {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 400 });
    }

    // Hoàn lại tiền cho user
    let wallet = await Wallet.findOne({ user: transaction.user });
    if (!wallet) {
      wallet = await Wallet.create({ user: transaction.user, balance: transaction.amount });
    } else {
      wallet.balance += transaction.amount;
      await wallet.save();
    }

    // Cập nhật transaction
    transaction.status = "rejected";
    transaction.adminNote = reason || "Yêu cầu bị từ chối";
    await transaction.save();

    revalidatePath("/admin/withdrawals");
    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

