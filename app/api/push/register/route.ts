import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fcmToken } = await request.json();

    if (!fcmToken) {
      return NextResponse.json(
        { error: "FCM token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update FCM token
    user.fcmToken = fcmToken;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error: any) {
    console.error("Error registering FCM token:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register FCM token" },
      { status: 500 }
    );
  }
}

