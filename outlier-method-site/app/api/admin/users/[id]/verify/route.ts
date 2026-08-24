import { NextResponse } from "next/server";
import { markEmailVerified } from "@/lib/db/users";

// Manual unblock for testers whose verification email never arrived (e.g.
// RESEND_API_KEY isn't configured yet, or a real send failed) — gated by the
// same admin-cookie check as the rest of /api/admin/* via middleware.ts.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await markEmailVerified(params.id);
  return NextResponse.json({ ok: true });
}
