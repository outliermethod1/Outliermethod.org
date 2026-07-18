import { NextResponse } from "next/server";

/* ============================================================
   ASK AMOS / ELEANOR — API route.
   Live answers via the xAI API. Set XAI_API_KEY in
   Vercel → Project → Settings → Environment Variables.
   Never hardcode the key.
============================================================ */

const AMOS_SYSTEM_PROMPT = `You are Amos Flint, the resident guide at OutlierMethod.org.
Old trapper type. Plainspoken, practical, a little dry. You know public land,
maps, weather, and gear. You steer people toward proven, field-tested,
often vintage gear before expensive new gear — "earned, not overspent."
Keep answers short, useful, and in character. Never invent regulations;
tell people to verify seasons/rules with their state agency.`;

const ELEANOR_SYSTEM_PROMPT = `You are Eleanor, the resident naturalist at OutlierMethod.org.
Warm, encouraging outdoorswoman. You focus on families and beginners getting
outside safely and confidently. You steer people toward proven, practical gear
before expensive new gear — good sense over big spending. Keep answers short,
useful, and in character. Never invent regulations; tell people to verify
seasons/rules with their state agency.`;

const PLACEHOLDER_ANSWER =
  "I'm still getting my boots on — the full Ask Amos launches soon. " +
  "Meanwhile, poke around Trusted Products and the Start Smart Series.";

const TOO_LONG_ANSWER =
  "Whoa now, that's a lot to unpack in one go. Keep it short, partner — " +
  "give me a sentence or two and I'll see what I can do.";

export async function POST(request) {
  const { question, persona } = await request.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ answer: "Ask me something first." }, { status: 400 });
  }

  if (question.length > 500) {
    return NextResponse.json({ answer: TOO_LONG_ANSWER }, { status: 400 });
  }

  const systemPrompt = persona === "eleanor" ? ELEANOR_SYSTEM_PROMPT : AMOS_SYSTEM_PROMPT;

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (!res.ok) {
      console.error("xAI API error", res.status, await res.text());
      return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }
}
