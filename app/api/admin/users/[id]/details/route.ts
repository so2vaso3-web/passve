import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Ticket from "@/models/Ticket";
import Transaction from "@/models/Transaction";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(params.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wallet
    let wallet = await Wallet.findOne({ user: params.id }).lean();
    if (!wallet) {
      // Create wallet if not exists
      const newWallet = await Wallet.create({
        user: params.id,
        balance: 0,
        escrow: 0,
        totalEarned: 0,
      });
      wallet = newWallet.toObject();
    }

    // Get tickets stats
    const [sellingTickets, soldTickets, purchasedTickets] = await Promise.all([
      Ticket.countDocuments({ seller: params.id, status: { $in: ["pending", "approved"] }, buyer: { $exists: false } }),
      Ticket.countDocuments({ seller: params.id, status: "sold" }),
      Ticket.countDocuments({ buyer: params.id, status: "sold" }),
    ]);

    // Get recent transactions
    const transactions = await Transaction.find({ user: params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get all tickets of user (both selling and purchased)
    const userTickets = await Ticket.find({
      $or: [
        { seller: params.id },
        { buyer: params.id },
      ],
    })
      .populate("seller", "name email")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      wallet: {
        balance: wallet.balance,
        escrow: wallet.escrow,
        totalEarned: wallet.totalEarned,
      },
      stats: {
        selling: sellingTickets,
        sold: soldTickets,
        purchased: purchasedTickets,
      },
      transactions: transactions.map((tx: any) => ({
        ...tx,
        _id: tx._id.toString(),
        user: tx.user.toString(),
        ticket: tx.ticket?.toString(),
        createdAt: tx.createdAt,
      })),
      tickets: userTickets.map((ticket: any) => ({
        _id: ticket._id.toString(),
        title: ticket.title || ticket.movieTitle,
        movieTitle: ticket.movieTitle,
        cinema: ticket.cinema,
        city: ticket.city,
        showDate: ticket.showDate,
        showTime: ticket.showTime,
        seats: ticket.seats,
        sellingPrice: ticket.sellingPrice,
        originalPrice: ticket.originalPrice,
        status: ticket.status,
        isExpired: ticket.isExpired,
        category: ticket.category,
        images: ticket.images,
        createdAt: ticket.createdAt,
        seller: ticket.seller ? {
          _id: ticket.seller._id.toString(),
          name: ticket.seller.name,
          email: ticket.seller.email,
        } : null,
        buyer: ticket.buyer ? {
          _id: ticket.buyer._id.toString(),
          name: ticket.buyer.name,
          email: ticket.buyer.email,
        } : null,
        soldAt: ticket.soldAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

