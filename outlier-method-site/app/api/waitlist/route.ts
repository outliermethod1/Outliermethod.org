import { NextRequest, NextResponse } from "next/server";
import { addWaitlistSignup } from "@/lib/db/business";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`waitlist:${ip}`);
  if (!allowed) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  const { email, stateCode, bylawId, kind } = (await req.json()) as {
    email?: string;
    stateCode?: string;
    bylawId?: string;
    kind?: "state_coverage" | "bylaw_amendment";
  };
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  await addWaitlistSignup({
    email,
    stateCode: stateCode ?? null,
    bylawId: bylawId ?? null,
    kind: kind ?? "state_coverage",
  });

  return NextResponse.json({ ok: true });
}
