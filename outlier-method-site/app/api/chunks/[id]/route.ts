import { NextResponse } from "next/server";
import { getChunkById } from "@/lib/db/chunks";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const chunk = await getChunkById(params.id);
  if (!chunk) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ chunk });
}
