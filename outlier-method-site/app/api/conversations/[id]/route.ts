import { NextResponse } from "next/server";
import { getConversation, listMessages } from "@/lib/db/conversations";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const conversation = await getConversation(params.id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await listMessages(params.id);
  return NextResponse.json({ conversation, messages });
}
