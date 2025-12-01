"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const hotTickets = [
  {
    id: 1,
    title: "Quỷ Ăn Tạng 3",
    image: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    category: "Phim",
  },
  {
    id: 2,
    title: "Concert Sơn Tùng M-TP",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500",
    category: "Concert",
  },
  {
    id: 3,
    title: "BlackPink World Tour - Hanoi",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
    category: "Concert",
  },
];

export function HeroBanner() {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" />
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Chợ Sang Nhượng Vé
            <br />
            <span className="text-primary-200">Xem Phim & Sự Kiện</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Mua bán vé uy tín, an toàn với hệ thống escrow tự động. 
            Bảo vệ cả người mua và người bán.
          </p>
          <div className="flex gap-4">
            <Link href="/sell">
              <Button size="lg" variant="secondary">
                Đăng bán vé ngay
              </Button>
            </Link>
            <Link href="#tickets">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                Xem vé hot
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hot tickets carousel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900/80 to-transparent p-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-white text-xl font-semibold">Vé đang cháy</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {hotTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex-shrink-0 w-48 group"
              >
                <div className="relative h-32 rounded-lg overflow-hidden bg-dark-800">
                  <Image
                    src={ticket.image}
                    alt={ticket.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-xs bg-primary-500 px-2 py-1 rounded mb-1 inline-block">
                      {ticket.category}
                    </span>
                    <p className="text-white font-medium text-sm">{ticket.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



