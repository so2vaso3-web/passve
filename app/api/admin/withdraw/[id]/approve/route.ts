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

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction || transaction.type !== "withdraw") {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "pending") {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 400 });
    }

    // Cập nhật transaction
    transaction.status = "completed";
    transaction.adminNote = "Đã chuyển tiền thành công";
    await transaction.save();

    // Tiền đã được trừ từ balance khi tạo transaction, không cần làm gì thêm
    // (vì khi withdraw, balance đã bị trừ)

    revalidatePath("/admin/withdrawals");
    revalidatePath("/profile");
    revalidateTag("wallet");
    revalidateTag("transactions");
    revalidateTag("stats");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

