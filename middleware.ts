import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = (token as any)?.role === "admin";

    // Bảo vệ /admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
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
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    // Không chặn /signup và các public routes
    "/((?!api|_next/static|_next/image|favicon.ico|signup|about|contact|faq|help|terms|privacy|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
