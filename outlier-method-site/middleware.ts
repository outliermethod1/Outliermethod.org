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

const NOINDEX_HEADER = "noindex, nofollow, noarchive";

function withNoindex(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", NOINDEX_HEADER);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return withNoindex(NextResponse.next());
  }

  if (isAdminPath) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifySessionToken(token))) {
      if (pathname.startsWith("/api/admin")) {
        return withNoindex(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
      }
      return withNoindex(NextResponse.redirect(new URL("/admin/login", req.url)));
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
  // /api/chat is NOT gated here — it's a public route now (anonymous
  // visitors get a few free questions) and does its own auth-or-anon-quota
  // resolution internally via lib/request-identity.ts.
  const COACH_API_PREFIXES = ["/api/conversations", "/api/export", "/api/tts"];
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

  return isAdminPath ? withNoindex(NextResponse.next()) : NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/profile/:path*",
    "/api/conversations/:path*",
    "/api/export/:path*",
    "/api/tts/:path*",
  ],
};
