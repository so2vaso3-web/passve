import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import AdminBank from "@/models/AdminBank";
import { revalidatePath } from "next/cache";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

// PUT: Cập nhật tài khoản ngân hàng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { bankName, accountNumber, accountHolder, qrCode, logo, type, displayOrder, isActive } = body;

    const bank = await AdminBank.findByIdAndUpdate(
      params.id,
      {
        bankName,
        accountNumber,
        accountHolder,
        qrCode: qrCode || undefined,
        logo: logo || undefined,
        type,
        displayOrder,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true }
    ).maxTimeMS(5000);

    if (!bank) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    // Revalidate để hiển thị ngay trên trang chủ và form nạp tiền
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin/banks");
    revalidateTag("admin-banks");

    return NextResponse.json({ success: true, bank });
  } catch (error: any) {
    console.error("Error updating admin bank:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa tài khoản ngân hàng
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bank = await AdminBank.findByIdAndDelete(params.id).maxTimeMS(5000);

    if (!bank) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    // Revalidate để hiển thị ngay trên trang chủ và form nạp tiền
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin/banks");
    revalidateTag("admin-banks");

    return NextResponse.json({ success: true, message: "Đã xóa tài khoản" });
  } catch (error: any) {
    console.error("Error deleting admin bank:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

