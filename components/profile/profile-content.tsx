"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";

export function ProfileContent() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions?type=buying");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-8">
        Tài khoản của tôi
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">
                    {session?.user?.name}
                  </h2>
                  {user && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-dark-600 dark:text-dark-400">
                        {user.rating.toFixed(1)} ({user.totalReviews} đánh giá)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {user && (
                <div className="space-y-3">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-dark-600 dark:text-dark-400 mb-1">
                      Số dư ví
                    </p>
                    <p className="text-2xl font-bold text-primary-500">
                      {formatPrice(user.wallet)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              { id: "info", label: "Thông tin" },
              { id: "transactions", label: "Giao dịch" },
              { id: "tickets", label: "Vé của tôi" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "info" && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Tên
                    </label>
                    <p className="text-dark-900 dark:text-dark-100">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Email
                    </label>
                    <p className="text-dark-900 dark:text-dark-100">{session?.user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "transactions" && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-xl font-semibold">Lịch sử giao dịch</h3>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-dark-500 py-8">
                    Chưa có giao dịch nào
                  </p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx._id}
                        className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-dark-900 dark:text-dark-100">
                              {tx.ticket?.movieTitle}
                            </p>
                            <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                              {tx.ticket?.cinema}
                            </p>
                            <p className="text-sm text-dark-500 mt-2">
                              Trạng thái:{" "}
                              <span
                                className={`font-medium ${
                                  tx.status === "completed"
                                    ? "text-green-500"
                                    : tx.status === "pending"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                              >
                                {tx.status === "completed"
                                  ? "Hoàn thành"
                                  : tx.status === "pending"
                                  ? "Đang xử lý"
                                  : "Đã hủy"}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary-500">
                              {formatPrice(tx.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "tickets" && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-xl font-semibold">Vé của tôi</h3>
              </CardHeader>
              <CardContent>
                <p className="text-center text-dark-500 py-8">
                  Chức năng đang phát triển
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



