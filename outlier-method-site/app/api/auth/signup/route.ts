import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db/users";
import { generateVerificationToken, hashPassword } from "@/lib/user-auth";
import { sendEmail, ADMIN_NOTIFY_EMAIL } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`signup:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const token = generateVerificationToken();
  const user = await createUser(email, passwordHash, token);

  const origin = req.nextUrl.origin;
  const verifyUrl = `${origin}/api/auth/verify?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your AD Chief of Staff account",
    html: `<p>Welcome to AD Chief of Staff.</p><p><a href="${verifyUrl}">Click here to verify your email</a> and finish setting up your account. This link expires in 48 hours.</p>`,
  });

  await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: "New AD Chief of Staff signup",
    html: `<p>New signup: ${user.email}</p><p>Signed up at ${new Date().toISOString()}.</p>`,
  });

  return NextResponse.json({ ok: true, message: "Check your email to verify your account." });
}
