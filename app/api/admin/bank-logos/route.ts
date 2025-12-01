import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import BankLogo from "@/models/BankLogo";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// GET: Lấy danh sách logo ngân hàng
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

// POST: Thêm logo ngân hàng (chỉ admin)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { bankName, shortName, code, logo, displayOrder, isActive } = body;

    if (!bankName || !shortName || !code || !logo) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Kiểm tra xem đã có logo cho ngân hàng này chưa
    const existing = await BankLogo.findOne({
      $or: [{ bankName }, { code }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Logo cho ngân hàng này đã tồn tại" },
        { status: 400 }
      );
    }

    const bankLogo = await BankLogo.create({
      bankName,
      shortName,
      code,
      logo,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    });

    // Revalidate để logo hiển thị ngay lập tức
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/sell");

    return NextResponse.json(
      { success: true, bankLogo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating bank logo:", error);
    return NextResponse.json(
      { error: error.message || "Có lỗi xảy ra khi thêm logo ngân hàng" },
      { status: 500 }
    );
  }
}

