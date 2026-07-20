import { NextResponse } from "next/server";
import { buildSystemPrompt, callGuideModel } from "../../../lib/guidePrompts";

/* ============================================================
   ASK AMOS / ELEANOR — API route.
   Live answers via the xAI API. Set XAI_API_KEY in
   Vercel → Project → Settings → Environment Variables.
   Never hardcode the key.
============================================================ */

const PLACEHOLDER_ANSWER =
  "I'm still getting my boots on — the full Ask Amos launches soon. " +
  "Meanwhile, poke around Trusted Products and the Start Smart Series.";

const TOO_LONG_ANSWER =
  "Whoa now, that's a lot to unpack in one go. Keep it short, partner — " +
  "give me a sentence or two and I'll see what I can do.";

const MAX_MESSAGE_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 1600;
const MAX_HISTORY = 12;

export async function POST(request) {
  const body = await request.json();
  const persona = body.persona;
  const context = typeof body.context === "string" ? body.context.slice(0, MAX_CONTEXT_LENGTH) : "";

  const rawMessages = Array.isArray(body.messages)
    ? body.messages
    : typeof body.question === "string"
      ? [{ role: "user", content: body.question }]
      : null;

  if (!rawMessages || rawMessages.length === 0) {
    return NextResponse.json({ answer: "Ask me something first." }, { status: 400 });
  }

  const messages = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0) {
    return NextResponse.json({ answer: "Ask me something first." }, { status: 400 });
  }

  if (messages.some((m) => m.role === "user" && m.content.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json({ answer: TOO_LONG_ANSWER }, { status: 400 });
  }

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }

  const systemPrompt = buildSystemPrompt(persona, context ? [context] : []);
  const history = messages.slice(-MAX_HISTORY);

  try {
    const answer = await callGuideModel(systemPrompt, history);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("xAI API error", err);
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }
}
