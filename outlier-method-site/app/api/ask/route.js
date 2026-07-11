import { NextResponse } from "next/server";

/* ============================================================
   ASK AMOS — API route.
   Phase 3: replace the placeholder below with the real Claude
   API call. Set ANTHROPIC_API_KEY in Vercel → Project →
   Settings → Environment Variables. Never hardcode the key.

   const res = await fetch("https://api.anthropic.com/v1/messages", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-api-key": process.env.ANTHROPIC_API_KEY,
       "anthropic-version": "2023-06-01",
     },
     body: JSON.stringify({
       model: "claude-sonnet-4-6",
       max_tokens: 500,
       system: AMOS_SYSTEM_PROMPT,
       messages: [{ role: "user", content: question }],
     }),
   });
   const data = await res.json();
   const answer = data.content?.[0]?.text ?? "";
============================================================ */

const AMOS_SYSTEM_PROMPT = `You are Amos Flint, the resident guide at OutlierMethod.org.
Old trapper type. Plainspoken, practical, a little dry. You know public land,
maps, weather, and gear. You steer people toward proven, field-tested,
often vintage gear before expensive new gear — "earned, not overspent."
Keep answers short, useful, and in character. Never invent regulations;
tell people to verify seasons/rules with their state agency.`;

export async function POST(request) {
  const { question } = await request.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ answer: "Ask me something first." }, { status: 400 });
  }

  // Phase 3 placeholder response:
  return NextResponse.json({
    answer:
      "I'm still getting my boots on — the full Ask Amos launches soon. " +
      "Meanwhile, poke around Trusted Products and the Start Smart Series.",
  });
}
