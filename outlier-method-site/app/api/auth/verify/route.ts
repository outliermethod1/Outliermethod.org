import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationToken, markEmailVerified } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  const user = await getUserByVerificationToken(token);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_or_expired_token", req.url));
  }

  await markEmailVerified(user.id);
  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
