import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./lib/auth";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "./lib/user-session";

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

  if (pathname.startsWith("/profile") || pathname.startsWith("/api/profile")) {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    const userId = await verifyUserSessionToken(token);
    if (!userId) {
      if (pathname.startsWith("/api/profile")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Coach Eli itself is gated: a signed-in beta tester, or an admin (via
  // /admin/login's shared password) covers both.
  const COACH_API_PREFIXES = ["/api/chat", "/api/conversations", "/api/export"];
  const isCoachPage = pathname === "/coach";
  const isCoachApi = COACH_API_PREFIXES.some((p) => pathname.startsWith(p));
  if (isCoachPage || isCoachApi) {
    const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authed = (await verifyUserSessionToken(userToken)) || (await verifySessionToken(adminToken));
    if (!authed) {
      if (isCoachApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", "/coach");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/api/profile/:path*",
    "/coach",
    "/api/chat/:path*",
    "/api/conversations/:path*",
    "/api/export/:path*",
  ],
};
