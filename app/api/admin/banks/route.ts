import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import AdminBank from "@/models/AdminBank";
import { revalidatePath, revalidateTag } from "next/cache";

// GET: Lấy danh sách tài khoản ngân hàng admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const banks = await AdminBank.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .maxTimeMS(5000);

    return NextResponse.json({ success: true, banks });
  } catch (error: any) {
    console.error("Error fetching admin banks:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// POST: Thêm tài khoản ngân hàng admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { bankName, accountNumber, accountHolder, qrCode, logo, type, displayOrder } = body;

    if (!bankName || !accountNumber || !accountHolder || !type) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const bank = await AdminBank.create({
      bankName,
      accountNumber,
      accountHolder,
      qrCode: qrCode || undefined,
      logo: logo || undefined,
      type,
      displayOrder: displayOrder || 0,
      isActive: true,
    });

    // Revalidate để hiển thị ngay trên trang chủ và form nạp tiền
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin/banks");
    revalidateTag("admin-banks");

    return NextResponse.json({ success: true, bank }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating admin bank:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

