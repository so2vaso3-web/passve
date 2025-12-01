"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Settings, Users, Ticket, DollarSign, FileText } from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  stats: {
    totalTickets: number;
    activeTickets: number;
    soldTickets: number;
    pendingWithdrawals: number;
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalWithdrawals: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    if (activeTab === "tickets") {
      fetchPendingTickets();
    } else {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchPendingTickets = async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleApproveTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        fetchPendingTickets();
      }
    } catch (error) {
      console.error("Error approving ticket:", error);
    }
  };

  const handleRejectTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        fetchPendingTickets();
      }
    } catch (error) {
      console.error("Error rejecting ticket:", error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-text mb-8">Admin Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/site-settings">
            <Card className="p-6 hover:bg-dark-border transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neon-green/20 rounded-lg">
                  <Settings className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <p className="text-sm text-dark-text2">Quản lý</p>
                  <p className="font-semibold text-dark-text">Trang chủ</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/tickets">
            <Card className="p-6 hover:bg-dark-border transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Ticket className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-text2">Vé chờ duyệt</p>
                  <p className="font-semibold text-dark-text">{stats.activeTickets}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="p-6 hover:bg-dark-border transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-text2">Tổng users</p>
                  <p className="font-semibold text-dark-text">{stats.totalUsers}</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/withdrawals">
            <Card className="p-6 hover:bg-dark-border transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-text2">Rút tiền chờ</p>
                  <p className="font-semibold text-dark-text">{stats.pendingWithdrawals}</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-dark-text2 mb-2">Tổng vé</p>
            <p className="text-2xl font-bold text-dark-text">{stats.totalTickets}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-dark-text2 mb-2">Vé đã bán</p>
            <p className="text-2xl font-bold text-neon-green">{stats.soldTickets}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-dark-text2 mb-2">Doanh thu</p>
            <p className="text-2xl font-bold text-neon-green">
              {new Intl.NumberFormat("vi-VN").format(stats.totalRevenue)} đ
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-dark-text2 mb-2">Users hoạt động</p>
            <p className="text-2xl font-bold text-dark-text">{stats.activeUsers}</p>
          </Card>
        </div>

        <Tabs
          tabs={[
            { id: "tickets", label: "Duyệt vé" },
            { id: "transactions", label: "Giao dịch" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

      {activeTab === "tickets" && (
        <div className="mt-6 space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-dark-500">
                Không có vé nào chờ duyệt
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">
                        {ticket.movieTitle}
                      </h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                        {ticket.cinema}, {ticket.city}
                      </p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        Ngày: {new Date(ticket.showDate).toLocaleDateString("vi-VN")} - {ticket.showTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveTicket(ticket._id)}
                        variant="primary"
                        size="sm"
                      >
                        Duyệt
                      </Button>
                      <Button
                        onClick={() => handleRejectTicket(ticket._id)}
                        variant="danger"
                        size="sm"
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="mt-6 space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-dark-500">
                Chưa có giao dịch nào
              </CardContent>
            </Card>
          ) : (
            transactions.map((tx) => (
              <Card key={tx._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{tx.ticket?.movieTitle}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        {tx.buyer?.name} → {tx.seller?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tx.amount)}
                      </p>
                      <p className="text-sm text-dark-500">
                        Phí:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tx.platformFee)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  );
}



