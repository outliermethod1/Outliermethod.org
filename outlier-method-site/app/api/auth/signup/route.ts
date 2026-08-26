import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, redeemFoundingCode } from "@/lib/db/users";
import { createUserSessionToken, generateVerificationToken, hashPassword } from "@/lib/user-auth";
import { sendEmail, ADMIN_NOTIFY_EMAIL } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`signup:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const { email, password, foundingCode } = (await req.json()) as {
    email?: string;
    password?: string;
    foundingCode?: string;
  };
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

  let validFoundingCode: string | undefined;
  if (foundingCode?.trim()) {
    const redeemed = await redeemFoundingCode(foundingCode);
    if (!redeemed) {
      return NextResponse.json({ error: "That founding-member code is invalid or fully used." }, { status: 400 });
    }
    validFoundingCode = foundingCode.trim();
  }

  const passwordHash = await hashPassword(password);
  const token = generateVerificationToken();
  const user = await createUser(email, passwordHash, token, validFoundingCode);

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

  // Log in immediately rather than requiring the verification email to be
  // clicked first — the whole point of removing the pre-chat signup wall is
  // a frictionless path in, and gating first login on an email round-trip
  // (especially with no email provider configured yet) defeats that. The
  // verification link is still sent and still works; it's just no longer a
  // hard blocker. Reconsider this if spam/abuse becomes a real problem.
  const sessionToken = await createUserSessionToken(user.id);
  return NextResponse.json({ ok: true, token: sessionToken, profileComplete: false });
}
