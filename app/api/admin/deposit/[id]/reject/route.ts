import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
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

    const body = await request.json();
    const { reason } = body;

    await connectDB();

    const transaction = await Transaction.findById(params.id);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.type !== "deposit") {
      return NextResponse.json({ error: "Not a deposit transaction" }, { status: 400 });
    }

    if (transaction.status === "completed") {
      return NextResponse.json({ error: "Cannot reject completed transaction" }, { status: 400 });
    }

    // Cập nhật transaction - KHÔNG cộng tiền
    await Transaction.findByIdAndUpdate(params.id, {
      status: "rejected",
      errorMessage: reason || "Rejected by admin",
    });

    revalidatePath("/admin/deposits");
    revalidateTag("transactions");
    revalidateTag("stats");

    return NextResponse.json({ success: true, message: "Deposit rejected" });
  } catch (error: any) {
    console.error("Reject deposit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject deposit" },
      { status: 500 }
    );
  }
}

