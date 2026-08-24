import { NextRequest, NextResponse } from "next/server";
import { getUserByResetToken, resetPassword } from "@/lib/db/users";
import { hashPassword } from "@/lib/user-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`reset-password:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const { token, password } = (await req.json()) as { token?: string; password?: string };
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const user = await getUserByResetToken(token);
  if (!user) {
    return NextResponse.json({ error: "That reset link is invalid or has expired." }, { status: 400 });
  }

  await resetPassword(user.id, await hashPassword(password));
  return NextResponse.json({ ok: true });
}
