import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.type !== "deposit") {
      return NextResponse.json({ error: "Not a deposit transaction" }, { status: 400 });
    }

    if (transaction.status === "completed") {
      return NextResponse.json({ error: "Transaction already completed" }, { status: 400 });
    }

    // Cộng tiền vào ví
    let wallet = await Wallet.findOne({ user: transaction.user });
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

    // Cập nhật transaction
    await Transaction.findByIdAndUpdate(params.id, {
      status: "completed",
      completedAt: new Date(),
    });

    revalidatePath("/admin/deposits");
    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");
    revalidateTag("stats");

    return NextResponse.json({ success: true, message: "Deposit approved" });
  } catch (error: any) {
    console.error("Approve deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve deposit" },
      { status: 500 }
    );
  }
}

