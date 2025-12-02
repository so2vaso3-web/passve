"use client";

import { useEffect, useState } from "react";
import { 
  Ticket, 
  TrendingUp, 
  Star, 
  Users, 
  DollarSign, 
  UserCheck, 
  Award,
  MapPin,
  XCircle,
  CheckCircle2
} from "lucide-react";

export function Stats() {
  const [stats, setStats] = useState({
    activeTickets: 0,
    successfulTransactions: 0,
    satisfactionRate: 0,
    totalUsers: 0,
    soldTickets: 0,
    totalRevenue: 0,
    activeUsers: 0,
    averageRating: 0,
    approvedTickets: 0,
    citiesCount: 0,
    cancelledTickets: 0,
  });
  const [counters, setCounters] = useState({
    tickets: 0,
    transactions: 0,
    satisfaction: 0,
    users: 0,
    sold: 0,
    revenue: 0,
    active: 0,
    rating: 0,
    approved: 0,
    cities: 0,
    cancelled: 0,
  });

  useEffect(() => {
    // Fetch stats từ API
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", {
          cache: "no-store",
        });
        const data = await res.json();
        // Chỉ update nếu số liệu thay đổi đáng kể để tránh nhảy số
        setStats((prev) => {
          const shouldUpdate = 
            Math.abs(data.activeTickets - prev.activeTickets) > 10 ||
            Math.abs(data.successfulTransactions - prev.successfulTransactions) > 10 ||
            data.satisfactionRate !== prev.satisfactionRate;
          
          return shouldUpdate ? data : prev;
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    // Refresh mỗi 60 giây (tăng từ 30s để giảm nhảy số)
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Animation counter - Chỉ animate khi số thay đổi đáng kể
  useEffect(() => {
    const animateCounter = (
      target: number,
      setter: (val: number) => void,
      current: number,
      duration = 2000
    ) => {
      // Nếu số thay đổi ít, không animate để tránh nhảy
      if (Math.abs(target - current) < 5 && current > 0) {
        setter(target);
        return;
      }

      let start = current || 0;
      const difference = target - start;
      const steps = duration / 16;
      const increment = difference / steps;
      
      const timer = setInterval(() => {
        start += increment;
        if ((increment > 0 && start >= target) || (increment < 0 && start <= target)) {
          setter(Math.round(target));
          clearInterval(timer);
        } else {
          setter(Math.round(start));
        }
      }, 16);
    };

    if (stats.activeTickets > 0) {
      animateCounter(stats.activeTickets, (val) =>
        setCounters((c) => ({ ...c, tickets: val })), counters.tickets
      );
    }
    if (stats.successfulTransactions > 0) {
      animateCounter(stats.successfulTransactions, (val) =>
        setCounters((c) => ({ ...c, transactions: val })), counters.transactions
      );
    }
    if (stats.satisfactionRate > 0) {
      animateCounter(stats.satisfactionRate, (val) =>
        setCounters((c) => ({ ...c, satisfaction: val })), counters.satisfaction
      );
    }
    if (stats.totalUsers > 0) {
      animateCounter(stats.totalUsers, (val) =>
        setCounters((c) => ({ ...c, users: val })), counters.users
      );
    }
    if (stats.soldTickets > 0) {
      animateCounter(stats.soldTickets, (val) =>
        setCounters((c) => ({ ...c, sold: val })), counters.sold
      );
    }
    if (stats.totalRevenue > 0) {
      animateCounter(stats.totalRevenue, (val) =>
        setCounters((c) => ({ ...c, revenue: val })), counters.revenue
      );
    }
    if (stats.activeUsers > 0) {
      animateCounter(stats.activeUsers, (val) =>
        setCounters((c) => ({ ...c, active: val })), counters.active
      );
    }
    if (stats.averageRating > 0) {
      animateCounter(stats.averageRating * 10, (val) =>
        setCounters((c) => ({ ...c, rating: val / 10 })), counters.rating * 10
      );
    }
    if (stats.approvedTickets > 0) {
      animateCounter(stats.approvedTickets, (val) =>
        setCounters((c) => ({ ...c, approved: val })), counters.approved
      );
    }
    if (stats.citiesCount > 0) {
      animateCounter(stats.citiesCount, (val) =>
        setCounters((c) => ({ ...c, cities: val })), counters.cities
      );
    }
  }, [stats]);

  const formatRevenue = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const statsCards = [
    {
      icon: Ticket,
      value: `${counters.tickets.toLocaleString()}+`,
      label: "Vé đang bán",
      key: "tickets",
    },
    {
      icon: TrendingUp,
      value: `${counters.transactions.toLocaleString()}+`,
      label: "Giao dịch thành công",
      key: "transactions",
    },
    {
      icon: Star,
      value: `${counters.satisfaction}%`,
      label: "Khách hàng hài lòng",
      key: "satisfaction",
    },
    {
      icon: Users,
      value: `${counters.users.toLocaleString()}+`,
      label: "Người dùng",
      key: "users",
    },
    {
      icon: CheckCircle2,
      value: `${counters.sold.toLocaleString()}+`,
      label: "Vé đã bán",
      key: "sold",
    },
    {
      icon: DollarSign,
      value: `${formatRevenue(counters.revenue)} VNĐ`,
      label: "Tổng doanh thu",
      key: "revenue",
    },
    {
      icon: UserCheck,
      value: `${counters.active.toLocaleString()}+`,
      label: "Người dùng hoạt động",
      key: "active",
    },
    {
      icon: Award,
      value: `${counters.rating.toFixed(1)}/5.0`,
      label: "Đánh giá trung bình",
      key: "rating",
    },
    {
      icon: Ticket,
      value: `${counters.approved.toLocaleString()}+`,
      label: "Vé đã duyệt",
      key: "approved",
    },
    {
      icon: MapPin,
      value: `${counters.cities}+`,
      label: "Thành phố",
      key: "cities",
    },
  ];

  return (
    <section className="bg-dark-card border-t border-dark-border py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-black text-dark-text text-center mb-8 md:mb-12">
          Thống kê nền tảng
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="bg-dark-bg border border-dark-border rounded-xl md:rounded-2xl p-4 md:p-6 shadow-card hover:shadow-neon hover:scale-[1.03] transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon-green rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-neon-sm">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-neon-green mb-1 md:mb-2 text-center leading-tight">
                  {card.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-dark-text2 text-center">
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



