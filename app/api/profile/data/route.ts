import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Ticket from "@/models/Ticket";

export const dynamic = "force-dynamic";
export const revalidate = 10; // Cache 10 giây

// API tổng hợp để load tất cả data profile 1 lần
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({
        wallet: { balance: 0, escrow: 0, totalEarned: 0 },
        stats: { selling: 0, sold: 0, purchased: 0 },
      });
    }

    const user = await User.findOne({ email: session.user.email }).maxTimeMS(3000).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Load tất cả data song song
    const [wallet, sellingTickets, soldTickets, purchasedTickets] = await Promise.all([
      Wallet.findOne({ user: user._id }).maxTimeMS(3000).lean().catch(() => null),
      Ticket.countDocuments({ seller: user._id, status: { $in: ["pending", "approved"] } }).maxTimeMS(3000).catch(() => 0),
      Ticket.countDocuments({ seller: user._id, status: "sold" }).maxTimeMS(3000).catch(() => 0),
      Ticket.countDocuments({ buyer: user._id, status: "sold" }).maxTimeMS(3000).catch(() => 0),
    ]);

    // Tạo wallet nếu chưa có
    let walletData: any = wallet;
    if (!walletData) {
      const newWallet = await Wallet.create({
        user: user._id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
      walletData = {
        balance: newWallet.balance,
        escrow: newWallet.escrow,
        totalEarned: newWallet.totalEarned,
      };
    }

    return NextResponse.json({
      wallet: {
        balance: (walletData as any)?.balance || 0,
        escrow: (walletData as any)?.escrow || 0,
        totalEarned: (walletData as any)?.totalEarned || 0,
      },
      stats: {
        selling: sellingTickets || 0,
        sold: soldTickets || 0,
        purchased: purchasedTickets || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      {
        wallet: { balance: 0, escrow: 0, totalEarned: 0 },
        stats: { selling: 0, sold: 0, purchased: 0 },
      },
      { status: 200 } // Return default values instead of error
    );
  }
}

