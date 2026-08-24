import { NextRequest, NextResponse } from "next/server";
import { setResetToken } from "@/lib/db/users";
import { generateVerificationToken } from "@/lib/user-auth";

// Manual fallback for when RESEND_API_KEY isn't configured: generates the
// same reset token /forgot-password would, and hands back the URL directly
// instead of emailing it, so an admin can pass it along to a tester by
// whatever channel actually works.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = generateVerificationToken();
  await setResetToken(params.id, token);
  const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;
  return NextResponse.json({ ok: true, resetUrl });
}
