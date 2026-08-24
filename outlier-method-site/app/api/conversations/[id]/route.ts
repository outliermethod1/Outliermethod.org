import { NextRequest, NextResponse } from "next/server";
import { deleteConversation, getConversation, listMessages } from "@/lib/db/conversations";
import { resolveIdentity, ownsConversation } from "@/lib/request-identity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await getConversation(params.id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const identity = await resolveIdentity(req);
  if (!ownsConversation(identity, conversation)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await listMessages(params.id);
  return NextResponse.json({ conversation, messages });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await getConversation(params.id);
  if (!conversation) return NextResponse.json({ ok: true }); // already gone

  const identity = await resolveIdentity(req);
  if (!ownsConversation(identity, conversation)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteConversation(params.id);
  return NextResponse.json({ ok: true });
}
