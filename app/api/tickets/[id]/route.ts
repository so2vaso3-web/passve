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

    // Nếu có updateData (không chỉ status), cho phép seller cập nhật
    if (Object.keys(updateData).length > 0) {
      // Seller hoặc admin có thể cập nhật thông tin
      if (isSeller || isAdmin) {
        // Cập nhật các trường được phép
        if (updateData.movieTitle) ticket.movieTitle = updateData.movieTitle;
        if (updateData.showDate) ticket.showDate = new Date(updateData.showDate);
        if (updateData.showTime) ticket.showTime = updateData.showTime;
        if (updateData.cinema) ticket.cinema = updateData.cinema;
        if (updateData.city) ticket.city = updateData.city;
        if (updateData.seats) ticket.seats = updateData.seats;
        if (updateData.quantity) ticket.quantity = updateData.quantity;
        if (updateData.originalPrice) ticket.originalPrice = updateData.originalPrice;
        if (updateData.sellingPrice) ticket.sellingPrice = updateData.sellingPrice;
        if (updateData.images) ticket.images = updateData.images;
        if (updateData.qrImage !== undefined) ticket.qrImage = updateData.qrImage;
        if (updateData.reason !== undefined) ticket.reason = updateData.reason;
        if (updateData.description !== undefined) ticket.description = updateData.description;

        // Cập nhật title dựa trên category và movieTitle
        if (updateData.category || updateData.movieTitle || updateData.seats) {
          const category = updateData.category || ticket.category;
          const movieTitle = updateData.movieTitle || ticket.movieTitle;
          const seats = updateData.seats || ticket.seats;
          ticket.title =
            category === "movie"
              ? `Vé xem phim ${movieTitle} - ${seats}`
              : category === "concert"
              ? `Vé concert ${movieTitle} - ${seats}`
              : `Vé sự kiện ${movieTitle} - ${seats}`;
        }

        // Recalculate expireAt nếu showDate hoặc showTime thay đổi
        if (updateData.showDate || updateData.showTime) {
          const showDate = updateData.showDate ? new Date(updateData.showDate) : ticket.showDate;
          const showTime = updateData.showTime || ticket.showTime;
          const [hours, minutes] = showTime.split(":").map(Number);
          const showDateTime = new Date(showDate);
          showDateTime.setHours(hours, minutes, 0, 0);
          ticket.expireAt = new Date(showDateTime.getTime() + 3 * 60 * 60 * 1000);
          ticket.isExpired = ticket.expireAt < new Date();
        }
      }
    }

    // Xử lý status update
    if (status) {
      if (isAdmin) {
        // Admin có thể cập nhật mọi status
        ticket.status = status;
      } else if (isSeller) {
        // Seller chỉ có thể toggle giữa pending và approved
        if (status === "pending" || status === "approved") {
          ticket.status = status;
        }
      }
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

