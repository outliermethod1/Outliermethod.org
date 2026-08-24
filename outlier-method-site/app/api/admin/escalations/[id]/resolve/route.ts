import { NextResponse } from "next/server";
import { resolveEscalation } from "@/lib/db/escalations";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await resolveEscalation(params.id);
  return NextResponse.json({ ok: true });
}
