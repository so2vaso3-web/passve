import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { EditPostForm } from "@/components/EditPostForm";

export default async function EditTicketPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/api/auth/signin?callbackUrl=/tickets/${params.id}/edit`);
  }

  try {
    await connectDB();
    const ticket = await Ticket.findById(params.id)
      .populate("seller", "name email image")
      .lean();

    if (!ticket) {
      redirect("/");
    }

    // Kiểm tra quyền: chỉ seller hoặc admin mới được sửa
    const isSeller =
      (ticket.seller as any)?._id?.toString() === (session.user as any).id;
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isSeller && !isAdmin) {
      redirect("/");
    }

    // Format ticket data để truyền vào form
    const ticketData = {
      id: ticket._id.toString(),
      category: ticket.category,
      movieTitle: ticket.movieTitle,
      showDate: ticket.showDate ? new Date(ticket.showDate).toISOString().split("T")[0] : "",
      showTime: ticket.showTime || "",
      cinema: ticket.cinema || "",
      city: ticket.city || "",
      seats: ticket.seats || "",
      quantity: ticket.quantity || 1,
      originalPrice: ticket.originalPrice?.toString() || "",
      sellingPrice: ticket.sellingPrice?.toString() || "",
      images: ticket.images || [],
      qrImage: ticket.qrImage || undefined,
      reason: ticket.reason || "",
      description: ticket.description || "",
    };

    return (
      <div className="min-h-screen bg-dark-bg py-4 sm:py-6 md:py-8">
        <EditPostForm ticketId={params.id} initialData={ticketData} />
      </div>
    );
  } catch (error) {
    console.error("Error loading ticket:", error);
    redirect("/");
  }
}

