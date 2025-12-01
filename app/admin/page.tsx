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
  await connectDB();

  const totalTickets = await Ticket.countDocuments();
  const activeTickets = await Ticket.countDocuments({
    status: { $in: ["pending", "approved"] },
    isExpired: false,
    expireAt: { $gt: new Date() },
  });
  const soldTickets = await Ticket.countDocuments({ status: "sold" });

  const pendingWithdrawals = await Transaction.countDocuments({
    type: "withdraw",
    status: "pending",
  });

  const totalUsers = await User.countDocuments({ role: "user" });
  const activeUsers = await User.countDocuments({ isActive: true, role: "user" });

  const totalRevenue = await Transaction.aggregate([
    { $match: { type: "deposit", status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalWithdrawals = await Transaction.aggregate([
    { $match: { type: "withdraw", status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    totalTickets,
    activeTickets,
    soldTickets,
    pendingWithdrawals,
    totalUsers,
    activeUsers,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalWithdrawals: totalWithdrawals[0]?.total || 0,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  const stats = await getAdminStats();

  return <AdminDashboard stats={stats} />;
}
