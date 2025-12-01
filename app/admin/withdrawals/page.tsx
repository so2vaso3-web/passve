import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { WithdrawalsList } from "@/components/WithdrawalsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPendingWithdrawals() {
  await connectDB();

  const withdrawals = await Transaction.find({
    type: "withdraw",
    status: "pending",
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return withdrawals.map((w: any) => ({
    ...w,
    _id: w._id.toString(),
    user: w.user ? {
      _id: (w.user as any)._id.toString(),
      name: (w.user as any).name,
      email: (w.user as any).email,
    } : null,
  }));
}

export default async function WithdrawalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  const withdrawals = await getPendingWithdrawals();

  return <WithdrawalsList withdrawals={withdrawals} />;
}

