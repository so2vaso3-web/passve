import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateWallet } from "@/utils/revalidate";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bankName, accountNumber, accountHolder, branch, isDefault } = body;

    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accountIndex = (dbUser.bankAccounts || []).findIndex(
      (acc: any) => acc._id?.toString() === params.id || acc.accountNumber === params.id
    );

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các tài khoản khác
    if (isDefault) {
      dbUser.bankAccounts = (dbUser.bankAccounts || []).map((acc: any, idx: number) => ({
        ...acc,
        isDefault: idx === accountIndex,
      }));
    } else {
      dbUser.bankAccounts[accountIndex] = {
        ...dbUser.bankAccounts[accountIndex],
        bankName,
        accountNumber,
        accountHolder,
        branch,
        isDefault: false,
      };
    }

    await dbUser.save();
    await revalidateWallet();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    dbUser.bankAccounts = (dbUser.bankAccounts || []).filter(
      (acc: any) => acc._id?.toString() !== params.id && acc.accountNumber !== params.id
    );

    await dbUser.save();
    await revalidateWallet();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

