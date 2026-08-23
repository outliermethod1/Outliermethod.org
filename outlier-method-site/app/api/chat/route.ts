import { NextRequest } from "next/server";
import { runCoachEli, extractCitedChunkIds, type ChatTurn } from "@/lib/ai/chat";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  addMessage,
  createConversation,
  getConversation,
  listMessages,
  logChatChunks,
  touchConversation,
} from "@/lib/db/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Slow down a beat, Coach needs a breather." }), {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((retryAfterMs ?? 1000) / 1000)) },
    });
  }

  const body = await req.json();
  const { stateCode, message, conversationId: incomingConversationId } = body as {
    stateCode: string;
    message: string;
    conversationId?: string;
  };

  if (!stateCode || !message?.trim()) {
    return new Response(JSON.stringify({ error: "stateCode and message are required" }), { status: 400 });
  }

  let conversationId = incomingConversationId;
  if (conversationId) {
    const existing = await getConversation(conversationId);
    if (!existing) conversationId = undefined;
  }
  if (!conversationId) {
    const conv = await createConversation(stateCode, message.slice(0, 60));
    conversationId = conv.id;
  }

  await addMessage(conversationId, "user", message);
  const priorMessages = await listMessages(conversationId);
  const history: ChatTurn[] = priorMessages.map((m) => ({ role: m.role, content: m.content }));

  const { stream, retrievedChunks } = await runCoachEli(stateCode, history);

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: conversation\ndata: ${JSON.stringify({ conversationId })}\n\n`)
      );
      try {
        for await (const delta of stream) {
          fullText += delta;
          controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: delta })}\n\n`));
        }

        const citedIds = extractCitedChunkIds(fullText);
        const mode = citedIds.length > 0 ? "A" : "B";
        const assistantMessage = await addMessage(conversationId!, "assistant", fullText, mode);
        if (citedIds.length > 0) {
          await logChatChunks(assistantMessage.id, citedIds);
        }
        await touchConversation(conversationId!);

        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({
              mode,
              citedChunkIds: citedIds,
              retrievedChunkIds: retrievedChunks.map((c) => c.id),
            })}\n\n`
          )
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: err instanceof Error ? err.message : "Unknown error" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
