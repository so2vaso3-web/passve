import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateWallet } from "@/utils/revalidate";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ bankAccounts: [] });
    }

    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      bankAccounts: (dbUser.bankAccounts || []).map((acc: any, index: number) => ({
        _id: acc._id?.toString() || acc.accountNumber || index.toString(),
        bankName: acc.bankName,
        accountNumber: acc.accountNumber,
        accountHolder: acc.accountHolder,
        branch: acc.branch,
        isDefault: acc.isDefault || false,
      })),
    });
  } catch (error: any) {
    console.error("Bank GET error:", error);
    return NextResponse.json({ bankAccounts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bankName, accountNumber, accountHolder, branch, isDefault } = body;

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please configure MongoDB." },
        { status: 503 }
      );
    }

    const dbUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newAccount = {
      bankName,
      accountNumber,
      accountHolder,
      branch,
      isDefault: isDefault || false,
    };

    // Nếu đặt làm mặc định, bỏ mặc định của các tài khoản khác
    if (isDefault) {
      dbUser.bankAccounts = (dbUser.bankAccounts || []).map((acc: any) => ({
        ...acc,
        isDefault: false,
      }));
    }

    dbUser.bankAccounts = [...(dbUser.bankAccounts || []), newAccount];
    await dbUser.save();

    // Reload user to get the _id of the newly added account
    const updatedUser = await User.findOne({ email: session.user.email }).maxTimeMS(5000);
    const savedAccount = updatedUser?.bankAccounts?.slice(-1)[0]; // Get the last account (the one we just added)

    await revalidateWallet();

    return NextResponse.json({ 
      success: true, 
      bankAccount: savedAccount ? {
        _id: (savedAccount as any)?._id?.toString() || savedAccount.accountNumber,
        ...(savedAccount as any).toObject ? (savedAccount as any).toObject() : savedAccount,
      } : newAccount 
    });
  } catch (error: any) {
    console.error("Bank POST error:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
