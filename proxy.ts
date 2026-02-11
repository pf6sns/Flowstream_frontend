import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Simple auth proxy:
 * - Keeps marketing pages, login, and signup public.
 * - Protects dashboard routes behind the auth cookie.
 * - Does NOT clear cookies or force logout; it only redirects when there is no session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that should always be accessible
  const publicPaths = ["/", "/login", "/signup", "/api/health"];

  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path));

  // Allow Next.js internals and static assets
  if (
    isPublic ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Only enforce auth for dashboard area (and anything we add to matcher)
  const needsAuth = pathname.startsWith("/dashboard");

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  // If there's no auth cookie, redirect to login but don't touch the cookie store.
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists – let the request continue. Any deeper validation happens in API routes.
  return NextResponse.next();
}

// Apply proxy only to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};

