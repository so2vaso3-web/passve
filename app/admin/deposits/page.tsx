import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { DepositsList } from "@/components/DepositsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPendingDeposits() {
  await connectDB();

  const deposits = await Transaction.find({
    type: "deposit",
    status: "pending",
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return deposits.map((d: any) => ({
    ...d,
    _id: d._id.toString(),
    user: d.user ? {
      _id: (d.user as any)._id.toString(),
      name: (d.user as any).name,
      email: (d.user as any).email,
    } : null,
  }));
}

export default async function DepositsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  const deposits = await getPendingDeposits();

  return <DepositsList deposits={deposits} />;
}

