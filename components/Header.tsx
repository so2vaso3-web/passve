"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Wallet, LayoutDashboard } from "lucide-react";
import { HeaderChatButton } from "./HeaderChatButton";
import Image from "next/image";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    // Load logo từ site settings
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.logo) {
          setSiteLogo(data.settings.logo);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  return (
    <header className="hidden md:block bg-dark-card border-b border-dark-border sticky top-0 z-50 shadow-card backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            {siteLogo && (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform">
                <Image
                  src={siteLogo}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <span className="text-lg sm:text-xl font-heading font-black text-dark-text hidden xs:block">
              Pass Vé Phim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              href="/"
              className="text-dark-text2 hover:text-neon-green transition-colors font-semibold text-base"
            >
              Trang chủ
            </Link>
            <Link
              href="/sell"
              className="text-dark-text2 hover:text-neon-green transition-colors font-semibold text-base"
            >
              Đăng bán vé
            </Link>
            {session && (
              <Link
                href="/profile?tab=selling"
                className="text-dark-text2 hover:text-neon-green transition-colors font-semibold text-base flex items-center gap-1"
              >
                <User size={16} />
                Tài khoản
              </Link>
            )}
            {session?.user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-dark-text2 hover:text-neon-green transition-colors font-semibold text-base flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <HeaderChatButton />
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-dark-border transition-colors group"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover border-2 border-dark-border group-hover:border-neon-green transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center text-white font-bold text-sm">
                      {session.user?.name?.[0]?.toUpperCase() || <User size={18} />}
                    </div>
                  )}
                  <span className="hidden lg:block text-dark-text2 font-semibold text-base group-hover:text-neon-green transition-colors">
                    {session.user?.name || "User"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-dark-text2 hover:text-neon-green transition-colors font-medium text-sm rounded-xl hover:bg-dark-border"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/api/auth/signin"
                  className="flex items-center gap-2 bg-dark-card hover:bg-dark-border text-dark-text border-2 border-dark-border hover:border-neon-green px-5 py-2.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                >
                  <User size={18} />
                  Đăng nhập
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-neon-green hover:bg-neon-green-light text-white px-5 py-2.5 rounded-xl font-semibold text-base transition-all hover:shadow-neon hover:scale-105 active:scale-95"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Post button */}
            <Link
              href="/sell"
              className="bg-neon-green hover:bg-neon-green-light text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all hover:shadow-neon hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Đăng tin miễn phí</span>
              <span className="sm:hidden">Đăng tin</span>
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-dark-border transition-colors text-dark-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-card border-t border-dark-border py-3 sm:py-4 px-3 sm:px-4">
            <Link
              href="/"
              className="block py-3 text-dark-text2 hover:text-neon-green transition-colors font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/sell"
              className="block py-3 text-dark-text2 hover:text-neon-green transition-colors font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Đăng bán vé
            </Link>
            {session && (
              <Link
                href="/profile?tab=selling"
                className="block py-3 text-dark-text2 hover:text-neon-green transition-colors font-semibold flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                Tài khoản
              </Link>
            )}
            {session?.user?.role === "admin" && (
              <Link
                href="/admin"
                className="block py-3 text-dark-text2 hover:text-neon-green transition-colors font-semibold flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={18} /> Admin
              </Link>
            )}
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 text-dark-text2 hover:text-neon-green transition-colors font-semibold flex items-center gap-2"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            ) : (
              <>
                <Link
                  href="/api/auth/signin"
                  className="block w-full bg-dark-card hover:bg-dark-border text-dark-text border-2 border-dark-border hover:border-neon-green py-3 rounded-xl font-semibold text-base transition-all mt-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} className="inline mr-2" />
                  Đăng nhập
                </Link>
                <Link
                  href="/signup"
                  className="block w-full bg-neon-green hover:bg-neon-green-light text-white py-3 rounded-xl font-semibold text-base transition-all mt-2 text-center hover:shadow-neon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
            <Link
              href="/sell"
              className="block w-full bg-neon-green hover:bg-neon-green-light text-white py-3 rounded-xl font-semibold text-base transition-all mt-2 text-center hover:shadow-neon"
              onClick={() => setMobileMenuOpen(false)}
            >
              Đăng tin miễn phí
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}