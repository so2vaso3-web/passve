import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Inter } from "next/font/google";
import { SiteSettingsLoader } from "@/components/SiteSettingsLoader";
import { WelcomeModal } from "@/components/WelcomeModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://passve.online";

export const metadata: Metadata = {
  title: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
  description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động",
  keywords: "vé phim, vé concert, vé sự kiện, mua bán vé, chợ vé",
  authors: [{ name: "Pass Vé Phim" }],
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
    description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động. Chợ sang nhượng vé số 1 Việt Nam.",
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "Pass Vé Phim",
    images: [
      {
        url: `${siteUrl}/opengraph-image`, // Dynamic OG image from Next.js
        width: 1200,
        height: 630,
        alt: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện",
    description: "Mua bán vé phim, vé concert, vé sự kiện uy tín, an toàn với hệ thống escrow tự động",
    images: [`${siteUrl}/opengraph-image`],
    site: "@passvephim",
    creator: "@passvephim",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <SiteSettingsLoader />
        <Providers>
          <WelcomeModal />
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
