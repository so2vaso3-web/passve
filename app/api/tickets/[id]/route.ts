import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { revalidatePath } from "next/cache";

// GET - Lấy thông tin vé theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const ticket = await Ticket.findById(params.id)
      .populate("seller", "name email image isActive")
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: "Vé không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Cập nhật vé (status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await Ticket.findById(params.id);

    if (!ticket) {
      return NextResponse.json({ error: "Vé không tồn tại" }, { status: 404 });
    }

    // Kiểm tra quyền: chỉ seller hoặc admin mới được sửa
    const isSeller = ticket.seller?.toString() === (session.user as any).id;
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa vé này" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, ...updateData } = body;

    // Chỉ cho phép cập nhật status nếu là seller (admin có thể cập nhật mọi thứ)
    if (status && isSeller && !isAdmin) {
      // Seller chỉ có thể toggle giữa pending và approved
      if (status === "pending" || status === "approved") {
        ticket.status = status;
      }
    } else if (isAdmin) {
      // Admin có thể cập nhật mọi thứ
      if (status) ticket.status = status;
      Object.assign(ticket, updateData);
    } else if (Object.keys(updateData).length > 0) {
      // Seller muốn cập nhật thông tin khác -> cần redirect đến edit page
      return NextResponse.json(
        { error: "Vui lòng sử dụng trang chỉnh sửa để cập nhật thông tin" },
        { status: 400 }
      );
    }

    await ticket.save();

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/my-tickets");

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa vé
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await Ticket.findById(params.id);

    if (!ticket) {
      return NextResponse.json({ error: "Vé không tồn tại" }, { status: 404 });
    }

    // Kiểm tra quyền: chỉ seller hoặc admin mới được xóa
    const isSeller = ticket.seller?.toString() === (session.user as any).id;
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa vé này" },
        { status: 403 }
      );
    }

    // Không cho phép xóa vé đã bán hoặc đang được giữ
    if (ticket.status === "sold" || ticket.status === "on_hold") {
      return NextResponse.json(
        { error: "Không thể xóa vé đã bán hoặc đang được giữ" },
        { status: 400 }
      );
    }

    await Ticket.findByIdAndDelete(params.id);

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/my-tickets");

    return NextResponse.json({ message: "Đã xóa vé thành công" });
  } catch (error: any) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

