import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./lib/auth";
import { verifyUserSessionToken } from "./lib/user-session";

// Beta-tester auth travels as an Authorization: Bearer header (checked here),
// not a cookie — the token lives in the client's sessionStorage
// (lib/auth-client.ts) so a new tab starts logged out. That means it can
// only be checked on API calls, which carry the header; a page navigation
// (GET /coach, GET /profile) can't, so those pages self-guard on mount
// instead (redirect client-side if no token/failed fetch) rather than
// relying on this middleware for the page shell itself.
function bearerToken(req: NextRequest): string | undefined {
  const auth = req.headers.get("authorization");
  return auth?.replace(/^Bearer\s+/i, "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifySessionToken(token))) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // /api/profile* — beta-tester header auth, or an admin cookie.
  if (pathname.startsWith("/api/profile")) {
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authed = (await verifyUserSessionToken(bearerToken(req))) || (await verifySessionToken(adminToken));
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Coach Eli's API surface — same two paths in. /api/export is opened via
  // window.open (a plain navigation, no custom headers possible), so it also
  // accepts the token as a ?token= query param as a fallback to the header.
  const COACH_API_PREFIXES = ["/api/chat", "/api/conversations", "/api/export"];
  if (COACH_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const queryToken = pathname.startsWith("/api/export") ? req.nextUrl.searchParams.get("token") : null;
    const authed =
      (await verifyUserSessionToken(bearerToken(req))) ||
      (await verifyUserSessionToken(queryToken)) ||
      (await verifySessionToken(adminToken));
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/profile/:path*",
    "/api/chat/:path*",
    "/api/conversations/:path*",
    "/api/export/:path*",
  ],
};
