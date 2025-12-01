"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Plus, CheckCircle } from "lucide-react";
import { TicketCard } from "@/components/TicketCard";
import toast from "react-hot-toast";

interface Ticket {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  location: string;
  category: string;
  image?: string;
  seller?: {
    name: string;
    avatar?: string;
  };
  showDate?: string | Date;
  showTime?: string;
  expireAt?: string | Date;
  isExpired?: boolean;
  createdAt?: string | Date;
  movieTitle?: string;
  cinema?: string;
  city?: string;
  seats?: string;
  status?: string;
}

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"selling" | "sold">("selling");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadTickets();
    }
  }, [status, activeTab, router]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const statusFilter =
        activeTab === "selling"
          ? "active"
          : "sold";

      const res = await fetch(
        `/api/tickets?user=${session?.user?.email}&status=${statusFilter}`
      );

      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast.error("Lỗi khi tải danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] pb-20">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0F19] border-b border-[#1F2937] px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Quản lý tin</h1>
          <button
            onClick={() => router.push("/sell")}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Đăng tin mới</span>
            <span className="sm:hidden">Đăng</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1F2937] bg-[#111827]">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("selling")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "selling"
                ? "text-[#10B981] border-[#10B981]"
                : "text-white/70 border-transparent"
            }`}
          >
            <Package className="w-4 h-4" />
            Tin đang bán
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${
              activeTab === "sold"
                ? "text-[#10B981] border-[#10B981]"
                : "text-white/70 border-transparent"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Đã bán
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70">Đang tải...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 mb-4">
              {activeTab === "selling"
                ? "Chưa có tin đang bán"
                : "Chưa có tin đã bán"}
            </p>
            {activeTab === "selling" && (
              <button
                onClick={() => router.push("/sell")}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Đăng tin mới
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} {...ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

