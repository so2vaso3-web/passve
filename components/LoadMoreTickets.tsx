"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { TicketCard } from "@/components/TicketCard";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface LoadMoreTicketsProps {
  initialTickets: any[];
  category?: string;
  city?: string;
  district?: string;
}

export function LoadMoreTickets({ initialTickets, category = "all", city = "all", district = "all" }: LoadMoreTicketsProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTickets.length >= 20);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Reset khi filter thay đổi
  useEffect(() => {
    setTickets(initialTickets);
    setPage(1);
    setHasMore(initialTickets.length >= 20);
  }, [initialTickets.length, category, city, district]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("limit", "20");
      if (category && category !== "all") params.set("category", category);
      if (city && city !== "all") params.set("city", city);
      if (district && district !== "all") params.set("district", district);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi khi tải vé");
      }

      if (data.tickets && data.tickets.length > 0) {
        setTickets((prev) => [...prev, ...data.tickets]);
        setPage((prev) => prev + 1);
        setHasMore(data.tickets.length >= 20);
      } else {
        setHasMore(false);
        toast.success("Đã tải hết vé!");
      }
    } catch (error: any) {
      console.error("Load more error:", error);
      toast.error(error.message || "Lỗi khi tải thêm vé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Render tickets */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && tickets.length > 0 && (
        <div className="text-center mt-12">
          <Button
            variant="secondary"
            size="md"
            onClick={loadMore}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? "Đang tải..." : "Xem thêm"}
          </Button>
        </div>
      )}
    </>
  );
}

