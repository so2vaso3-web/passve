import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { TicketsManagement } from "@/components/TicketsManagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTickets() {
  await connectDB();

  const tickets = await Ticket.find()
    .populate("seller", "name email")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return tickets.map((t: any) => ({
    ...t,
    _id: t._id.toString(),
    seller: t.seller ? {
      _id: (t.seller as any)._id.toString(),
      name: (t.seller as any).name,
      email: (t.seller as any).email,
    } : null,
  }));
}

export default async function AdminTicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  const tickets = await getTickets();

  return <TicketsManagement tickets={tickets} />;
}

