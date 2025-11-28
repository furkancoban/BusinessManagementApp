import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    if (pathname === "/setup") return NextResponse.next();
    if (!token?.businessId && pathname !== "/setup") {
      return NextResponse.redirect(new URL("/setup", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/", "/customers/:path*", "/products/:path*", "/orders/:path*", "/reports/:path*", "/settings/:path*", "/setup"],
};

