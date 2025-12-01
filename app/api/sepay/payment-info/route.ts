import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

// GET: Lấy thông tin payment SePay
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
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

    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transaction = await Transaction.findById(transactionId).maxTimeMS(5000);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (transaction.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse VA number từ sepayPaymentUrl nếu có
    const vaNumber = transaction.sepayPaymentUrl;
    const qrCode = transaction.sepayPaymentUrl?.startsWith("data:") ? transaction.sepayPaymentUrl : null;

    return NextResponse.json({
      transactionId: transaction._id.toString(),
      vaNumber: vaNumber,
      qrCode: qrCode,
      amount: transaction.amount,
      status: transaction.status,
    });
  } catch (error: any) {
    console.error("Error fetching payment info:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment info" },
      { status: 500 }
    );
  }
}

