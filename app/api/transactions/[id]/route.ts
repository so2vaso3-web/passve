import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

// GET: Lấy thông tin transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 503 }
      );
    }

    const transaction = await Transaction.findById(params.id)
      .populate("user", "name email")
      .lean()
      .maxTimeMS(5000);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if user owns this transaction
    const User = (await import("@/models/User")).default;
    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    
    if (!dbUser || transaction.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

