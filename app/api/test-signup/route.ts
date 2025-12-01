import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Test endpoint để kiểm tra signup
export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    const dbStatus = db ? "Connected" : "Not connected";
    
    const testUser = await User.findOne({ email: "test@example.com" }).maxTimeMS(3000).catch(() => null);
    
    return NextResponse.json({
      database: dbStatus,
      testUserExists: !!testUser,
      message: "Test endpoint working",
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      database: "Error",
    }, { status: 500 });
  }
}

