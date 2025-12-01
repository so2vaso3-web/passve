"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Plus, MessageCircle, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/profile?tab=selling", label: "Quản lý tin", icon: Package },
    { href: "/sell", label: "Đăng tin", icon: Plus, isPrimary: true },
    { href: "/profile?tab=messages", label: "Chat", icon: MessageCircle },
    { href: "/profile", label: "Tài khoản", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50 md:hidden shadow-card">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href.includes("profile") && pathname?.includes("profile")) ||
            (item.href === "/" && pathname === "/");
          
          if (item.isPrimary) {
            return (
              <div key={item.href} className="flex flex-col items-center -mt-8">
                <Link
                  href={item.href}
                  className="w-14 h-14 bg-neon-green rounded-full flex items-center justify-center shadow-neon hover:bg-neon-green-light transition-all hover:scale-105"
                >
                  <item.icon className="w-7 h-7 text-white" strokeWidth={3} />
                </Link>
                <Link
                  href={item.href}
                  className="mt-1 bg-neon-green text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-neon-green-light transition-colors"
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
              className="flex flex-col items-center gap-1 flex-1"
            >
              <item.icon
                className={`w-6 h-6 ${
                  isActive ? "text-neon-green" : "text-dark-text2"
                }`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-neon-green font-semibold" : "text-dark-text2"
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

