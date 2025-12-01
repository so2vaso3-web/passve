"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { TicketCard } from "./ticket-card";
import { Ticket } from "@/types/ticket";

export function TicketGrid() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchTickets();
  }, [page]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?page=${page}&limit=12`);
      const data = await res.json();
      
      if (page === 1) {
        setTickets(data.tickets);
      } else {
        setTickets((prev) => [...prev, ...data.tickets]);
      }
      
      setHasMore(data.tickets.length === 12);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-80 bg-dark-200 dark:bg-dark-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div id="tickets">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
          Vé mới nhất
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tickets.map((ticket) => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="mt-8 flex justify-center">
          {loading && (
            <div className="text-primary-500">Đang tải thêm...</div>
          )}
        </div>
      )}
    </div>
  );
}



