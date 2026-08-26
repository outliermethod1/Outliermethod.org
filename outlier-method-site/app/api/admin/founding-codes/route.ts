import { NextRequest, NextResponse } from "next/server";
import { listFoundingCodes, createFoundingCode } from "@/lib/db/business";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ codes: await listFoundingCodes() });
}

export async function POST(req: NextRequest) {
  const { code, maxUses, note } = (await req.json()) as { code?: string; maxUses?: number; note?: string };
  if (!code?.trim()) return NextResponse.json({ error: "Code is required." }, { status: 400 });
  const created = await createFoundingCode(code, maxUses ?? 1, note);
  return NextResponse.json({ ok: true, code: created });
}
