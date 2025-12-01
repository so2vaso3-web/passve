"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Ticket } from "@/types/ticket";
import { format } from "date-fns";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link href={`/tickets/${ticket._id}`}>
      <Card hover className="h-full flex flex-col">
        <div className="relative h-48 w-full">
          {ticket.moviePoster ? (
            <Image
              src={ticket.moviePoster}
              alt={ticket.movieTitle}
              fill
              className="object-cover rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {ticket.movieTitle[0]}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {ticket.category === "movie" ? "Phim" : ticket.category === "concert" ? "Concert" : "Sự kiện"}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-dark-900 dark:text-dark-100 mb-2 line-clamp-2">
            {ticket.movieTitle}
          </h3>
          
          <div className="space-y-1.5 text-sm text-dark-600 dark:text-dark-400 mb-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{ticket.cinema}, {ticket.city}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(ticket.showDate), "dd/MM/yyyy")} - {ticket.showTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{ticket.seats.length} ghế: {ticket.seats.join(", ")}</span>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-dark-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-500 dark:text-dark-400 line-through">
                  {formatPrice(ticket.originalPrice)}
                </p>
                <p className="text-xl font-bold text-primary-500">
                  {formatPrice(ticket.sellingPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

