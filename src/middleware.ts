import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Allow setup page even without business
    if (pathname === "/setup") {
      return NextResponse.next();
    }

    // If user doesn't have a business and is not on setup page, redirect
    if (!token?.businessId && pathname !== "/setup") {
      return NextResponse.redirect(new URL("/setup", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/customers/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/setup",
  ],
};
