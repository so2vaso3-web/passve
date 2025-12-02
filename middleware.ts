import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

// Function để check maintenance mode
async function checkMaintenanceMode(): Promise<boolean> {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne();
    return settings?.maintenanceMode || false;
  } catch (error) {
    console.error("Error checking maintenance mode:", error);
    return false;
  }
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = (token as any)?.role === "admin";
    const pathname = req.nextUrl.pathname;

    // Bảo vệ /admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check maintenance mode - chỉ check cho non-API routes và non-admin routes
    // Exclude: /api, /maintenance, /admin (admin đã được check ở trên), static files
    if (
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/maintenance") &&
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/_next") &&
      !pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
    ) {
      const maintenanceMode = await checkMaintenanceMode();
      
      if (maintenanceMode && !isAdmin) {
        // Redirect non-admin users to maintenance page
        if (pathname !== "/maintenance") {
          return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      } else if (maintenanceMode && isAdmin && pathname === "/maintenance") {
        // Admin should not see maintenance page
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Cho phép truy cập /admin nếu có token và là admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return (token as any)?.role === "admin";
        }
        // Cho phép truy cập tất cả routes khác (maintenance check sẽ handle redirect)
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
