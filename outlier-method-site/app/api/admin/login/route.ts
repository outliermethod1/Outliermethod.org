import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, checkAdminPassword, createSessionToken } from "@/lib/auth";
import { recentFailedAttempts, recordAdminLoginAttempt } from "@/lib/db/admin-login-attempts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Lockout: 10 failed attempts in the last hour blocks this IP entirely.
  const failedInHour = await recentFailedAttempts(ip, 60);
  if (failedInHour >= 10) {
    console.error(`Admin login locked out: ${failedInHour} failed attempts from ${ip} in the last hour.`);
    return NextResponse.json(
      { error: "Too many failed attempts. Locked out for an hour." },
      { status: 429 }
    );
  }
  // Rate limit: 5 attempts per 15 minutes on top of that.
  const failedInWindow = await recentFailedAttempts(ip, 15);
  if (failedInWindow >= 5) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  // checkAdminPassword does a constant-time comparison — see lib/auth.ts.
  const ok = typeof password === "string" && checkAdminPassword(password);

  await recordAdminLoginAttempt(ip, ok);
  if (!ok) {
    console.error(`Failed admin login attempt from ${ip} at ${new Date().toISOString()}.`);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // No maxAge — a session cookie, cleared when the browser fully closes.
    // The 12-hour expiry baked into the signed token itself still caps how
    // long a session is valid even if the browser somehow keeps it alive.
  });
  return res;
}
