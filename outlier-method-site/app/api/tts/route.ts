import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Coach Eli reads his own answers back in this voice by default — pick a
// different one from your ElevenLabs voice library and set
// ELEVENLABS_VOICE_ID if you want something else. "Adam" is a reasonable
// masculine default for a veteran AD.
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

async function fromStudio(spoken: string): Promise<Response | null> {
  const appKey = process.env.VOICE_APPS_KEY;
  if (!appKey) return null;
  // The timeout covers only the wait for the first audio; once it starts, the stream runs to the end.
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(process.env.STUDIO_SPEAK_URL || "https://www.adchiefofstaff.com/api/voice/studio/speak", {
      method: "POST",
      headers: { Authorization: `Bearer ${appKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: spoken, app: "chiefofstaff", language: "en", stream: true }),
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (r.status !== 200 || !r.body) return null;
    return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Voice-Source": "studio" } });
  } catch (e) {
    clearTimeout(timer);
    console.error("Studio voice unavailable:", (e as Error).message);
    return null;
  }
}

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // middleware.ts already confirmed some valid session (user token or admin
  // cookie) got this far — that's the whole gate. A user's own "Voice"
  // profile toggle only controls whether playback happens automatically
  // without being asked; it isn't a hard requirement to use Listen or Voice
  // Mode, which are explicit in-the-moment choices to hear this answer.
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // Strip citation markers and collapse whitespace so ElevenLabs doesn't try
  // to read "bracket bracket cite colon..." out loud.
  const spoken = text
    .replace(/\[\[cite:[a-f0-9-]+\]\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000); // ElevenLabs' per-request character ceiling

  // First choice: Coach Eli's voice from Ryan's own Outlier Voice Studio (his Mac), relayed by Reggie.
  // It answers 204 when the Mac is off, and then ElevenLabs takes over as before.
  const studio = await fromStudio(spoken);
  if (studio) return studio;

  if (!apiKey) {
    return NextResponse.json({ error: "No voice is available right now." }, { status: 503 });
  }
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: spoken,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text();
    console.error(`ElevenLabs TTS failed (${res.status}): ${body}`);
    return NextResponse.json({ error: "Voice generation failed." }, { status: 502 });
  }

  return new Response(res.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
