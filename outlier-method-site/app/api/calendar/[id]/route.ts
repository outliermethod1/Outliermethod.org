import { NextResponse } from "next/server";
import { deleteUserDeadline } from "@/lib/db/deadlines";
import { getCurrentUser } from "@/lib/current-user";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteUserDeadline(params.id, user.id);
  return NextResponse.json({ ok: true });
}
