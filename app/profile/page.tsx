"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Package,
  CheckCircle,
  Ticket,
  Wallet,
  MessageCircle,
  CreditCard,
  LogOut,
  Star,
} from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { ProfileTabs } from "@/components/ProfileTabs";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";

interface WalletData {
  balance: number;
  escrow: number;
  totalEarned: number;
}

interface Stats {
  selling: number;
  sold: number;
  purchased: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "";
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    escrow: 0,
    totalEarned: 0,
  });
  const [stats, setStats] = useState<Stats>({
    selling: 0,
    sold: 0,
    purchased: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      // Load data ngay lập tức, không block UI
      loadData();
    }
  }, [status, session, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tất cả data từ 1 API duy nhất (nhanh hơn)
      const res = await fetch("/api/profile/data", { 
        cache: "default",
        next: { revalidate: 10 } // Cache 10 giây
      });

      if (res.ok) {
        const data = await res.json();
        setWallet({
          balance: data.wallet?.balance || 0,
          escrow: data.wallet?.escrow || 0,
          totalEarned: data.wallet?.totalEarned || 0,
        });
        setStats({
          selling: data.stats?.selling || 0,
          sold: data.stats?.sold || 0,
          purchased: data.stats?.purchased || 0,
        });
      } else {
        // Fallback: load từng API riêng nếu API tổng hợp fail
        const [walletRes, sellingRes, soldRes, purchasedRes] = await Promise.all([
          fetch("/api/wallet/balance", { cache: "default" }),
          fetch(`/api/tickets?user=${session?.user?.email}&status=active&limit=1`, { cache: "default" }),
          fetch(`/api/tickets?user=${session?.user?.email}&status=sold&limit=1`, { cache: "default" }),
          fetch(`/api/tickets?user=${session?.user?.email}&status=purchased&limit=1`, { cache: "default" }),
        ]);

        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWallet({
            balance: walletData.balance || 0,
            escrow: walletData.escrow || 0,
            totalEarned: walletData.totalEarned || 0,
          });
        }

        const sellingData = sellingRes.ok ? await sellingRes.json() : { tickets: [] };
        const soldData = soldRes.ok ? await soldRes.json() : { tickets: [] };
        const purchasedData = purchasedRes.ok ? await purchasedRes.json() : { tickets: [] };

        setStats({
          selling: sellingData.tickets?.length || 0,
          sold: soldData.tickets?.length || 0,
          purchased: purchasedData.tickets?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Không hiển thị error, chỉ log để không làm gián đoạn UX
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất?")) return;
    await signOut({ callbackUrl: "/" });
    toast.success("Đã đăng xuất");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Hiển thị UI ngay lập tức, không đợi loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0F19] pb-20">
        <div className="container mx-auto px-4 py-8">
          {/* Loading Skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-dark-card rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-dark-card rounded-xl"></div>
              <div className="h-24 bg-dark-card rounded-xl"></div>
              <div className="h-24 bg-dark-card rounded-xl"></div>
            </div>
            <div className="h-64 bg-dark-card rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      icon: Package,
      label: "Tin đã bán",
      href: "/profile?tab=sold",
      count: stats.sold,
      onClick: () => {
        const currentScroll = window.scrollY;
        router.push("/profile?tab=sold");
        setTimeout(() => window.scrollTo(0, currentScroll), 0);
      },
    },
    {
      icon: Ticket,
      label: "Vé đã mua",
      href: "/profile?tab=purchased",
      count: stats.purchased,
      onClick: () => {
        const currentScroll = window.scrollY;
        router.push("/profile?tab=purchased");
        setTimeout(() => window.scrollTo(0, currentScroll), 0);
      },
    },
    {
      icon: MessageCircle,
      label: "Tin nhắn",
      href: "/chat",
      onClick: () => router.push("/chat"),
    },
    {
      icon: Wallet,
      label: "Ví & giao dịch",
      href: "/profile?tab=transactions",
      onClick: () => {
        const currentScroll = window.scrollY;
        router.push("/profile?tab=transactions");
        setTimeout(() => window.scrollTo(0, currentScroll), 0);
      },
    },
    {
      icon: CreditCard,
      label: "Ngân hàng của tôi",
      href: "/profile?tab=bank",
      onClick: () => {
        const currentScroll = window.scrollY;
        router.push("/profile?tab=bank");
        setTimeout(() => window.scrollTo(0, currentScroll), 0);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] pb-20 md:pb-0">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-[#0B0F19] border-b border-[#1F2937] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "deposit" || activeTab === "withdraw") {
                router.push("/profile");
              } else if (activeTab) {
                router.push("/profile");
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {activeTab === "deposit" && (
            <h1 className="text-lg font-bold text-white">Nạp tiền</h1>
          )}
          {activeTab === "withdraw" && (
            <h1 className="text-lg font-bold text-white">Rút tiền</h1>
          )}
          {(!activeTab || (activeTab !== "deposit" && activeTab !== "withdraw")) && (
            <span className="text-sm font-medium">
              {activeTab ? "Quay lại" : "Quay lại Trang chủ"}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card - Ẩn khi ở tab deposit hoặc withdraw */}
        {activeTab !== "deposit" && activeTab !== "withdraw" && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={100}
                  height={100}
                  className="rounded-full object-cover border-4 border-[#1F2937]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#10B981] flex items-center justify-center border-4 border-[#1F2937]">
                  <span className="text-3xl font-bold text-white">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-white mb-2">
              {session.user?.name || "Người dùng"}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white/70 text-sm">
                0.0 ({stats.sold + stats.selling} tin)
              </span>
            </div>

            {/* Wallet Balance - Moved below avatar */}
            <div className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#10B981]" />
                  <p className="text-white/70 text-sm">Số dư ví</p>
                </div>
                <button
                  onClick={() => {
                    const currentScroll = window.scrollY;
                    router.push("/profile?tab=transactions");
                    setTimeout(() => window.scrollTo(0, currentScroll), 0);
                  }}
                  className="text-[#10B981] text-xs font-semibold hover:text-[#059669] transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
              <p className="text-[#10B981] text-2xl font-black text-center mb-3">
                {formatPrice(wallet.balance)} đ
              </p>
              
              {/* Nạp tiền và Rút tiền buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    const currentScroll = window.scrollY;
                    router.push("/profile?tab=deposit");
                    setTimeout(() => window.scrollTo(0, currentScroll), 0);
                  }}
                  className="bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#059669] hover:to-[#10B981] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-neon-sm active:scale-[0.98]"
                >
                  Nạp tiền
                </button>
                <button
                  onClick={() => {
                    const currentScroll = window.scrollY;
                    router.push("/profile?tab=withdraw");
                    setTimeout(() => window.scrollTo(0, currentScroll), 0);
                  }}
                  className="bg-gradient-to-r from-[#EF4444] to-[#F87171] hover:from-[#DC2626] hover:to-[#EF4444] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98]"
                >
                  Rút tiền
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Statistics - Ẩn khi ở tab deposit hoặc withdraw */}
        {activeTab !== "deposit" && activeTab !== "withdraw" && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-white/70 text-xs mb-1">Tin đang bán</p>
              <p className="text-white text-lg font-bold">{stats.selling}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-white/70 text-xs mb-1">Đã bán</p>
              <p className="text-white text-lg font-bold">{stats.sold}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Ticket className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-white/70 text-xs mb-1">Vé đã mua</p>
              <p className="text-white text-lg font-bold">{stats.purchased}</p>
            </div>
          </div>
        </div>
        )}

        {/* Show Deposit/Withdraw Form directly if on deposit/withdraw tab */}
        {activeTab === "deposit" && (
          <DepositForm
            userId={session.user?.email || ""}
            onSuccess={async () => {
              router.refresh();
            }}
          />
        )}

        {activeTab === "withdraw" && (
          <WithdrawForm
            balance={wallet.balance}
            onClose={() => router.push("/profile")}
            onSuccess={async () => {
              router.refresh();
            }}
          />
        )}

        {/* Show ProfileTabs if tab is selected, otherwise show menu items */}
        {activeTab && activeTab !== "" && activeTab !== "deposit" && activeTab !== "withdraw" && (
          <ProfileTabs
            activeTab={activeTab}
            userId={session.user?.email || ""}
            wallet={wallet}
            bankAccounts={[]}
          />
        )}

        {(!activeTab || activeTab === "") && (
          <>
            {/* Menu Items */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    <button
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1F2937] active:bg-[#1F2937] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="w-5 h-5 text-white/70" />
                        <span className="text-white font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.count !== undefined && (
                          <span className="text-white/50 text-sm">{item.count}</span>
                        )}
                        <svg
                          className="w-5 h-5 text-white/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                    {index < menuItems.length - 1 && (
                      <div className="h-px bg-[#1F2937] mx-5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-[#1F2937] transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Đăng xuất</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
