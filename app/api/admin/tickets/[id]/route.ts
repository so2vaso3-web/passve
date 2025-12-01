import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await Ticket.findByIdAndDelete(params.id);

    revalidatePath("/");
    revalidatePath("/admin/tickets");
    revalidateTag("tickets");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, isExpired } = body;

    await connectDB();

    const ticket = await Ticket.findById(params.id).populate("seller");
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isExpired !== undefined) updateData.isExpired = isExpired;

    // If status changed to "sold", release escrow with 7% fee deduction
    if (status === "sold" && ticket.status !== "sold") {
      const sellerWallet = await Wallet.findOne({ user: ticket.seller._id });
      if (sellerWallet && sellerWallet.escrow >= ticket.sellingPrice) {
        // Deduct 7% fee from seller
        const sellerFee = Math.round(ticket.sellingPrice * 0.07);
        const sellerReceives = ticket.sellingPrice - sellerFee;
        
        // Release escrow to seller balance
        sellerWallet.escrow -= ticket.sellingPrice;
        sellerWallet.balance += sellerReceives;
        sellerWallet.totalEarned += sellerReceives;
        await sellerWallet.save();

        // Create transaction record
        await Transaction.create({
          user: ticket.seller._id,
          type: "escrow_release",
          amount: sellerReceives,
          status: "completed",
          description: `Bán vé ${ticket.movieTitle} - ${ticket.cinema} (sau phí nền tảng 7%)`,
          ticket: ticket._id,
        });
      }
    }

    await Ticket.findByIdAndUpdate(params.id, updateData);

    revalidatePath("/");
    revalidatePath("/admin/tickets");
    revalidateTag("tickets");
    revalidateTag("wallet");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

