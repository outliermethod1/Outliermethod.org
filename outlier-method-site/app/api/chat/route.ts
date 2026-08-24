import { NextRequest } from "next/server";
import { runCoachEli, extractCitedChunkIds, type ChatTurn } from "@/lib/ai/chat";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/current-user";
import {
  addMessage,
  createConversation,
  getConversation,
  listMessages,
  logChatChunks,
  touchConversation,
} from "@/lib/db/conversations";
import { resolveIdentity, ownsConversation } from "@/lib/request-identity";
import { generateAnonId, signAnonId, ANON_COOKIE_NAME } from "@/lib/anon-session";
import { getOrCreateAnonSession, getIpUsageCount, incrementAnonExchange } from "@/lib/db/anon-sessions";
import { effectiveExchangeCount, remainingFreeQuestions, hashIp, FREE_QUESTION_LIMIT } from "@/lib/anon-quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(body: unknown, status: number, extraHeaders?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return jsonResponse(
      { error: "Rate limit exceeded. Slow down a beat, Coach needs a breather." },
      429,
      { "Retry-After": String(Math.ceil((retryAfterMs ?? 1000) / 1000)) }
    );
  }

  const body = await req.json();
  const { stateCode, message, conversationId: incomingConversationId } = body as {
    stateCode: string;
    message: string;
    conversationId?: string;
  };

  if (!stateCode || !message?.trim()) {
    return jsonResponse({ error: "stateCode and message are required" }, 400);
  }

  let conversationId = incomingConversationId;
  let stream: AsyncIterable<string>;
  let retrievedChunks: { id: string }[];
  let anonId: string | null = null;
  let newAnonCookie: string | null = null;
  let remaining: number | null = null;
  try {
    const identity = await resolveIdentity(req);
    const isAuthed = identity.isAdmin || !!identity.userId;

    // Anonymous visitor: gate on the free-question quota before doing any
    // real work. The cookie's session id is authoritative; the per-IP count
    // is only a backstop against cookie-clearing (see lib/anon-quota.ts).
    if (!isAuthed) {
      anonId = identity.anonSessionId ?? generateAnonId();
      if (!identity.anonSessionId) newAnonCookie = await signAnonId(anonId);

      const ipHash = await hashIp(ip);
      const session = await getOrCreateAnonSession(anonId, ipHash);
      const ipUsageCount = await getIpUsageCount(ipHash);
      const used = effectiveExchangeCount(session.exchange_count, ipUsageCount);

      if (used >= FREE_QUESTION_LIMIT) {
        return jsonResponse(
          { error: "free_limit_reached", remaining: 0 },
          403,
          newAnonCookie ? { "Set-Cookie": anonCookieHeader(newAnonCookie) } : undefined
        );
      }

      const newCount = await incrementAnonExchange(anonId, ipHash);
      remaining = remainingFreeQuestions(newCount, ipUsageCount);
    }

    if (conversationId) {
      const existing = await getConversation(conversationId);
      if (!existing || !ownsConversation(identity, existing)) {
        conversationId = undefined;
      }
    }
    if (!conversationId) {
      const conv = await createConversation(stateCode, message.slice(0, 60), {
        userId: identity.userId,
        anonSessionId: anonId,
      });
      conversationId = conv.id;
    }

    await addMessage(conversationId, "user", message);
    const priorMessages = await listMessages(conversationId);
    const history: ChatTurn[] = priorMessages.map((m) => ({ role: m.role, content: m.content }));

    // Admin sessions and anonymous visitors have no bearer token, so this is
    // null for them — Eli just won't have a signature to sign with.
    const currentUser = identity.userId ? await getCurrentUser() : null;
    const result = await runCoachEli(stateCode, history, { signature: currentUser?.signature ?? null });
    stream = result.stream;
    retrievedChunks = result.retrievedChunks;
  } catch (err) {
    console.error("chat route setup failed:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error setting up chat" },
      500
    );
  }

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`event: conversation\ndata: ${JSON.stringify({ conversationId })}\n\n`)
      );
      if (remaining !== null) {
        controller.enqueue(encoder.encode(`event: quota\ndata: ${JSON.stringify({ remaining })}\n\n`));
      }
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

  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  if (newAnonCookie) headers["Set-Cookie"] = anonCookieHeader(newAnonCookie);

  return new Response(readable, { headers });
}

function anonCookieHeader(signedValue: string): string {
  const oneYear = 60 * 60 * 24 * 365;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ANON_COOKIE_NAME}=${signedValue}; Path=/; Max-Age=${oneYear}; HttpOnly; SameSite=Lax${secure}`;
}
