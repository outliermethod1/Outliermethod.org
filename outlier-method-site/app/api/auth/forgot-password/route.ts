import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setResetToken } from "@/lib/db/users";
import { generateVerificationToken } from "@/lib/user-auth";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`forgot-password:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  // Same response whether or not the account exists — don't let this
  // endpoint be used to check which emails have accounts.
  if (user) {
    const token = generateVerificationToken();
    await setResetToken(user.id, token);
    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your AD Chief of Staff password",
      html: `<p>Click the link below to set a new password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  }

  return NextResponse.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
}
