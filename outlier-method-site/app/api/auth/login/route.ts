import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/users";
import { createUserSessionToken, verifyPassword } from "@/lib/user-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`login:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  // Email verification is no longer a login gate (see signup route) — it's
  // still tracked and the link still works, just doesn't block first use.

  const token = await createUserSessionToken(user.id);
  // Returned in the body, not a cookie — the client keeps it in
  // sessionStorage (see lib/auth-client.ts) so a new tab genuinely starts
  // logged out instead of inheriting a browser-wide cookie.
  return NextResponse.json({
    ok: true,
    token,
    profileComplete: !!(user.name && user.school),
  });
}
