import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  getMessageById,
  getConversation,
  getPrecedingUserMessage,
  getCitedChunkIds,
} from "@/lib/db/conversations";
import { getChunksByIds } from "@/lib/db/chunks";
import { getState } from "@/lib/db/states";
import { resolveIdentity, ownsConversation } from "@/lib/request-identity";

export const dynamic = "force-dynamic";

// Permanent, read-only record of one exchange: the question, Eli's exact
// stored answer, and every bylaw he cited with its verbatim text — so a
// dispute over "what it said" is a lookup, not an argument. The hash is
// computed fresh from the current DB row every time this is viewed; since
// bylaw amendments insert a new chunk and mark the old one superseded
// rather than editing it in place, a chunk cited here never changes text
// out from under a viewer. The hash exists to make silent tampering
// detectable, not to imply the record could otherwise drift.
export async function GET(req: NextRequest, { params }: { params: { messageId: string } }) {
  const message = await getMessageById(params.messageId);
  if (!message || message.role !== "assistant") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const conversation = await getConversation(message.conversation_id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const identity = await resolveIdentity(req);
  if (!ownsConversation(identity, conversation)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [question, chunkIds, state] = await Promise.all([
    getPrecedingUserMessage(message),
    getCitedChunkIds(message.id),
    getState(conversation.state_code),
  ]);
  const chunks = await getChunksByIds(chunkIds);
  // Preserve citation order as they appear in the answer, not DB order.
  const orderedChunks = chunkIds.map((id) => chunks.find((c) => c.id === id)).filter((c) => !!c);

  const hashInput = JSON.stringify({
    messageId: message.id,
    content: message.content,
    createdAt: message.created_at,
    chunks: orderedChunks.map((c) => ({ id: c!.id, body: c!.body, effective_date: c!.effective_date })),
  });
  const hash = createHash("sha256").update(hashInput).digest("hex");

  return NextResponse.json({
    message: { id: message.id, content: message.content, mode: message.mode, created_at: message.created_at },
    question: question ? { content: question.content, created_at: question.created_at } : null,
    conversation: { id: conversation.id, state_code: conversation.state_code, title: conversation.title },
    state: state ? { state_name: state.state_name, association_name: state.association_name } : null,
    chunks: orderedChunks.map((c) => ({
      id: c!.id,
      bylaw_id: c!.bylaw_id,
      title: c!.title,
      body: c!.body,
      effective_date: c!.effective_date,
      source_doc: c!.source_doc,
      source_page: c!.source_page,
    })),
    integrityHash: hash,
  });
}
