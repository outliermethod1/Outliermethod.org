import { NextResponse } from "next/server";
import { getState } from "@/lib/db/states";
import { listCurrentChunksForState } from "@/lib/db/chunks";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const state = await getState(params.code);
  if (!state) return NextResponse.json({ error: "Unknown state" }, { status: 404 });
  const chunks = await listCurrentChunksForState(params.code);
  return NextResponse.json({ state, chunks });
}
