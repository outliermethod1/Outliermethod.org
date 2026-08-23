import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, checkAdminPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (typeof password !== "string" || !checkAdminPassword(password)) {
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
