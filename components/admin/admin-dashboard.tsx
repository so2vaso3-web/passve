"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";

export function AdminDashboard() {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-8">
        Admin Dashboard
      </h1>

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
  );
}

