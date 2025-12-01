import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
        _id: acc._id || index.toString(),
        ...acc,
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

    await revalidateWallet();

    return NextResponse.json({ success: true, bankAccount: newAccount });
  } catch (error: any) {
    console.error("Bank POST error:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
