"use client";

import { useEffect, useState } from "react";
import { Ticket, TrendingUp, Star } from "lucide-react";

export function Stats() {
  const [stats, setStats] = useState({
    activeTickets: 0,
    successfulTransactions: 0,
    satisfactionRate: 0,
  });
  const [counters, setCounters] = useState({
    tickets: 0,
    transactions: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    // Fetch stats từ API
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", {
          cache: "no-store",
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animation counter
  useEffect(() => {
    const animateCounter = (
      target: number,
      setter: (val: number) => void,
      duration = 2000
    ) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    if (stats.activeTickets > 0) {
      animateCounter(stats.activeTickets, (val) =>
        setCounters((c) => ({ ...c, tickets: val }))
      );
    }
    if (stats.successfulTransactions > 0) {
      animateCounter(stats.successfulTransactions, (val) =>
        setCounters((c) => ({ ...c, transactions: val }))
      );
    }
    if (stats.satisfactionRate > 0) {
      animateCounter(stats.satisfactionRate, (val) =>
        setCounters((c) => ({ ...c, satisfaction: val }))
      );
    }
  }, [stats]);

  return (
    <section className="bg-dark-card border-t border-dark-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-dark-bg border border-dark-border rounded-2xl p-6 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="w-12 h-12 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-neon-green mb-2 text-center">
              {counters.tickets.toLocaleString()}+
            </div>
            <div className="text-sm font-semibold text-dark-text2 text-center">
              Vé đang bán
            </div>
          </div>

          <div className="bg-dark-bg border border-dark-border rounded-2xl p-6 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="w-12 h-12 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-neon-green mb-2 text-center">
              {counters.transactions.toLocaleString()}+
            </div>
            <div className="text-sm font-semibold text-dark-text2 text-center">
              Giao dịch thành công
            </div>
          </div>

          <div className="bg-dark-bg border border-dark-border rounded-2xl p-6 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all">
            <div className="w-12 h-12 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neon-sm">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-neon-green mb-2 text-center">
              {counters.satisfaction}%
            </div>
            <div className="text-sm font-semibold text-dark-text2 text-center">
              Khách hàng hài lòng
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

