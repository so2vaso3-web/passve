import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminBank from "@/models/AdminBank";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Lấy danh sách tài khoản ngân hàng (public API - không cần auth)
export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ banks: [] });
    }

    const banks = await AdminBank.find({ 
      isActive: true,
      type: "bank" // Chỉ lấy ngân hàng
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .maxTimeMS(5000);

    return NextResponse.json({ banks });
  } catch (error: any) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách ngân hàng" },
      { status: 500 }
    );
  }
}

