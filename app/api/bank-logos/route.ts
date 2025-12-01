import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BankLogo from "@/models/BankLogo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Lấy danh sách logo ngân hàng (public API - không cần auth)
export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ bankLogos: [] });
    }

    const bankLogos = await BankLogo.find({ isActive: true })
      .sort({ displayOrder: 1, bankName: 1 })
      .lean()
      .maxTimeMS(5000);

    return NextResponse.json({ bankLogos });
  } catch (error: any) {
    console.error("Error fetching bank logos:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách logo ngân hàng" },
      { status: 500 }
    );
  }
}



