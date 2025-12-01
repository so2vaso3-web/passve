import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

export const dynamic = "force-dynamic";
export const revalidate = 10; // Cache 10 giây

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ balance: 0, escrow: 0, totalEarned: 0 });
    }

    const user = await User.findOne({ email: session.user.email }).maxTimeMS(3000).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let wallet = await Wallet.findOne({ user: user._id }).maxTimeMS(3000).lean();
    if (!wallet) {
      // Tạo wallet mới nếu chưa có
      const newWallet = await Wallet.create({
        user: user._id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
      return NextResponse.json({
        balance: newWallet.balance,
        escrow: newWallet.escrow,
        totalEarned: newWallet.totalEarned,
      });
    }

    return NextResponse.json({
      balance: wallet.balance,
      escrow: wallet.escrow,
      totalEarned: wallet.totalEarned,
    });
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { balance: 0, escrow: 0, totalEarned: 0 }, // Return default values instead of error
      { status: 200 }
    );
  }
}

