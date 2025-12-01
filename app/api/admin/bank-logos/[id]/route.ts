import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import BankLogo from "@/models/BankLogo";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// PUT: Cập nhật logo ngân hàng
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
        { error: "Database not connected" },
        { status: 503 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { bankName, shortName, code, logo, displayOrder, isActive } = body;

    const bankLogo = await BankLogo.findByIdAndUpdate(
      id,
      {
        ...(bankName && { bankName }),
        ...(shortName && { shortName }),
        ...(code && { code }),
        ...(logo && { logo }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!bankLogo) {
      return NextResponse.json(
        { error: "Không tìm thấy logo ngân hàng" },
        { status: 404 }
      );
    }

    // Revalidate để logo hiển thị ngay lập tức
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/sell");

    return NextResponse.json({ success: true, bankLogo });
  } catch (error: any) {
    console.error("Error updating bank logo:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi cập nhật logo" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa logo ngân hàng
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
        { error: "Database not connected" },
        { status: 503 }
      );
    }

    const { id } = params;
    const bankLogo = await BankLogo.findByIdAndDelete(id);

    if (!bankLogo) {
      return NextResponse.json(
        { error: "Không tìm thấy logo ngân hàng" },
        { status: 404 }
      );
    }

    // Revalidate để logo cập nhật ngay lập tức
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/sell");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bank logo:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi xóa logo" },
      { status: 500 }
    );
  }
}

