import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * NextAuth middleware for route protection.
 *
 * Protects /dashboard — redirects unauthenticated users to /login.
 * If a user manually deletes their session cookie, the JWT verification
 * will fail and they'll be redirected to /login automatically.
 */
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Only protect these routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
