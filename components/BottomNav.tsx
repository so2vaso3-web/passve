"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, MessageCircle, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sellingCount, setSellingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      // Fetch selling count
      fetch(`/api/tickets?user=${session.user.email}&status=active`)
        .then((res) => res.json())
        .then((data) => {
          if (data.tickets) {
            setSellingCount(data.tickets.length);
          }
        })
        .catch(() => {});

      // Fetch unread messages count
      fetch("/api/chat/unread-count")
        .then((res) => res.json())
        .then((data) => {
          if (data.count !== undefined) {
            setUnreadCount(data.count);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/my-tickets",
      label: "Quản lý tin",
      icon: Package,
      badge: sellingCount > 0 ? sellingCount : null,
      isActive: pathname?.includes("/my-tickets"),
    },
    {
      href: "/sell",
      label: "Đăng tin",
      icon: Plus,
      isPrimary: true,
      isActive: pathname?.includes("/sell"),
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : null,
      isActive: pathname?.includes("/chat"),
    },
    {
      href: "/profile",
      label: "Tài khoản",
      icon: User,
      isActive: pathname?.includes("/profile") && !pathname?.includes("messages"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0F19] border-t border-[#1F2937] z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          if (item.isPrimary) {
            return (
              <div key={item.href} className="flex flex-col items-center -mt-8">
                <Link
                  href={item.href}
                  className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/50 hover:bg-[#059669] transition-all hover:scale-105"
                >
                  <item.icon className="w-8 h-8 text-white" strokeWidth={3} />
                </Link>
                <Link
                  href={item.href}
                  className="mt-1 bg-[#10B981] text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-[#059669] transition-colors"
                >
                  {item.label}
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 relative"
            >
              <div className="relative">
                <item.icon
                  className={`w-6 h-6 ${
                    item.isActive ? "text-[#10B981]" : "text-white/70"
                  }`}
                  strokeWidth={item.isActive ? 2.5 : 1.5}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs ${
                  item.isActive
                    ? "text-[#10B981] font-semibold"
                    : "text-white/70"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

