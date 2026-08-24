import { NextResponse } from "next/server";
import { deleteStateDeadline } from "@/lib/db/deadlines";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await deleteStateDeadline(params.id);
  return NextResponse.json({ ok: true });
}
