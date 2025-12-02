import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAdminStats() {
  try {
    const db = await connectDB();
    if (!db) {
      return {
        totalTickets: 0,
        activeTickets: 0,
        soldTickets: 0,
        pendingWithdrawals: 0,
        pendingDeposits: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        totalWithdrawals: 0,
      };
    }

    const [totalTickets, activeTickets, soldTickets, pendingWithdrawals, pendingDeposits, totalUsers, activeUsers, totalRevenue, totalWithdrawals] = await Promise.all([
      Ticket.countDocuments().maxTimeMS(5000).catch(() => 0),
      Ticket.countDocuments({
        status: { $in: ["pending", "approved"] },
        isExpired: false,
        expireAt: { $gt: new Date() },
      }).maxTimeMS(5000).catch(() => 0),
      Ticket.countDocuments({ status: "sold" }).maxTimeMS(5000).catch(() => 0),
      Transaction.countDocuments({
        type: "withdraw",
        status: "pending",
      }).maxTimeMS(5000).catch(() => 0),
      Transaction.countDocuments({
        type: "deposit",
        status: "pending",
      }).maxTimeMS(5000).catch(() => 0),
      User.countDocuments({ role: "user" }).maxTimeMS(5000).catch(() => 0),
      User.countDocuments({ isActive: true, role: "user" }).maxTimeMS(5000).catch(() => 0),
      Transaction.aggregate([
        { $match: { type: "deposit", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ], { maxTimeMS: 5000 }).catch(() => [{ total: 0 }]),
      Transaction.aggregate([
        { $match: { type: "withdraw", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ], { maxTimeMS: 5000 }).catch(() => [{ total: 0 }]),
    ]);

    return {
      totalTickets: totalTickets || 0,
      activeTickets: activeTickets || 0,
      soldTickets: soldTickets || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      pendingDeposits: pendingDeposits || 0,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue: (totalRevenue as any)[0]?.total || 0,
      totalWithdrawals: (totalWithdrawals as any)[0]?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalTickets: 0,
      activeTickets: 0,
      soldTickets: 0,
      pendingWithdrawals: 0,
      pendingDeposits: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalWithdrawals: 0,
    };
  }
}

export default async function AdminPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      redirect("/");
    }

    const stats = await getAdminStats();

    return <AdminDashboard stats={stats} />;
  } catch (error: any) {
    console.error("Admin page error:", error);
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-text mb-4">Có lỗi xảy ra</h1>
          <p className="text-dark-text2 mb-4">{error.message || "Lỗi không xác định"}</p>
          <a href="/" className="text-neon-green hover:underline">Về trang chủ</a>
        </div>
      </div>
    );
  }
}
