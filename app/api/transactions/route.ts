import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const buyer = await User.findOne({ email: session.user.email });
    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { ticketId, paymentMethod } = await request.json();

    const ticket = await Ticket.findById(ticketId).populate("seller");
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status !== "approved") {
      return NextResponse.json({ error: "Ticket not available" }, { status: 400 });
    }

    if (ticket.seller._id.toString() === buyer._id.toString()) {
      return NextResponse.json({ error: "Cannot buy your own ticket" }, { status: 400 });
    }

    const amount = ticket.sellingPrice;
    const platformFee = amount * 0.12;
    const sellerAmount = amount - platformFee;

    // Tạo transaction
    const transaction = await Transaction.create({
      ticket: ticket._id,
      buyer: buyer._id,
      seller: ticket.seller._id,
      amount,
      platformFee,
      sellerAmount,
      paymentMethod,
      status: "pending",
    });

    // Tạo payment URL (sandbox)
    const paymentUrl = await createPaymentUrl({
      amount,
      transactionId: transaction._id.toString(),
      paymentMethod,
    });

    return NextResponse.json({ transactionId: transaction._id.toString(), paymentUrl });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

async function createPaymentUrl({
  amount,
  transactionId,
  paymentMethod,
}: {
  amount: number;
  transactionId: string;
  paymentMethod: "momo" | "vnpay";
}): Promise<string> {
  // Đây là mock URL cho sandbox
  // Trong production, bạn cần tích hợp với Momo/VNPay API thật
  if (paymentMethod === "momo") {
    return `https://test-payment.momo.vn/v2/gateway/api/create?amount=${amount}&orderId=${transactionId}`;
  } else {
    return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${amount}&orderId=${transactionId}`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "buying" | "selling"

    const query: any = type === "buying" ? { buyer: user._id } : { seller: user._id };

    const transactions = await Transaction.find(query)
      .populate("ticket", "movieTitle cinema showDate")
      .populate("buyer", "name")
      .populate("seller", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        _id: t._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

