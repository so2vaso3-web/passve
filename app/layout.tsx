import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
  description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động",
  keywords: "vé phim, vé concert, vé sự kiện, mua bán vé, chợ vé",
  authors: [{ name: "Pass Vé Phim" }],
  icons: {
    icon: "/icon-192.png",
  },
  openGraph: {
    title: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
    description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pass Vé Phim",
    description: "Mua bán vé phim, vé concert, vé sự kiện uy tín",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body className="bg-dark-bg text-dark-text min-h-screen font-body antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1E293B',
                color: '#F1F5F9',
                border: '1px solid #334155',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                fontFamily: 'var(--font-inter)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F1F5F9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F1F5F9',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
