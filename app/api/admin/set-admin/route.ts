import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;

    // Secret key để bảo vệ (đổi thành secret của bạn)
    if (secret !== "SET_ADMIN_SECRET_2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB not connected" },
        { status: 503 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    ).maxTimeMS(5000);

    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${email}. Please login with Google first.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã set role admin cho ${user.name} (${user.email})`,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Set admin error:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}



