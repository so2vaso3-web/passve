import { TicketDetails } from "@/components/ticket/ticket-details";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

async function getTicket(id: string) {
  await connectDB();
  const ticket = await Ticket.findById(id)
    .populate("seller", "name image rating totalReviews")
    .lean();

  if (!ticket) return null;

  return {
    ...ticket,
    _id: ticket._id.toString(),
    seller: {
      ...ticket.seller,
      _id: ticket.seller._id.toString(),
    },
  };
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);

  if (!ticket) {
    notFound();
  }

  return <TicketDetails ticket={ticket as any} />;
}

