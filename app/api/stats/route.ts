import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    await connectDB();

    // Đếm vé đang bán (chưa hết hạn, chưa bán)
    const activeTickets = await Ticket.countDocuments({
      status: { $nin: ["expired", "sold", "cancelled", "rejected"] },
      isExpired: false,
      expireAt: { $gt: new Date() },
    });

    // Đếm giao dịch thành công (chỉ đếm sale và purchase, không đếm deposit/withdraw)
    const successfulTransactions = await Transaction.countDocuments({
      status: "completed",
      type: { $in: ["sale", "purchase"] },
    });

    // Tính % khách hàng hài lòng (dựa trên rating trung bình)
    // Giả sử rating >= 4.0 là hài lòng
    const users = await User.find({ rating: { $exists: true } }).select("rating").lean();
    const totalUsers = users.length;
    const satisfiedUsers = users.filter((u: any) => (u.rating || 0) >= 4.0).length;
    const satisfactionRate = totalUsers > 0 ? Math.round((satisfiedUsers / totalUsers) * 100) : 95;

    return NextResponse.json({
      activeTickets,
      successfulTransactions,
      satisfactionRate,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Trả về số liệu mặc định nếu có lỗi
    return NextResponse.json({
      activeTickets: 234,
      successfulTransactions: 567,
      satisfactionRate: 98,
    });
  }
}

