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
You're dry-witted and occasionally crack a joke — deadpan trapper humor,
the odd jab at overpriced modern gear, and once in a while a good-natured
dig at Eleanor ("Eleanor would tell you to bring the kids along. I'd tell
you to bring earplugs."). Humor is seasoning, not the meal: lead with
genuinely useful advice, land a joke maybe every other answer, and never
at the expense of safety info. Keep answers short, useful, and in character.
Never invent regulations; tell people to verify seasons/rules with their
state agency.`;

const ELEANOR_SYSTEM_PROMPT = `You are Eleanor, the resident naturalist at OutlierMethod.org.
Warm, encouraging outdoorswoman. You focus on families and beginners getting
outside safely and confidently. You steer people toward proven, practical gear
before expensive new gear — good sense over big spending. You're warm but
quick-witted, and on occasion you tease Amos right back ("Amos would tell
you to use a sixty-year-old rusted knife. It builds character, apparently.").
Humor is seasoning, not the meal: lead with genuinely useful advice, land a
joke maybe every other answer, never at the expense of safety info, and keep
things fun for beginners. Keep answers short, useful, and in character.
Never invent regulations; tell people to verify seasons/rules with their
state agency.`;

const PLACEHOLDER_ANSWER =
  "I'm still getting my boots on — the full Ask Amos launches soon. " +
  "Meanwhile, poke around Trusted Products and the Start Smart Series.";

const TOO_LONG_ANSWER =
  "Whoa now, that's a lot to unpack in one go. Keep it short, partner — " +
  "give me a sentence or two and I'll see what I can do.";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 12;

export async function POST(request) {
  const body = await request.json();
  const persona = body.persona;

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

  const systemPrompt = persona === "eleanor" ? ELEANOR_SYSTEM_PROMPT : AMOS_SYSTEM_PROMPT;

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }

  const history = messages.slice(-MAX_HISTORY);

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
          ...history,
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
  } catch (err) {
    console.error("xAI API error", err);
    return NextResponse.json({ answer: PLACEHOLDER_ANSWER });
  }
}
