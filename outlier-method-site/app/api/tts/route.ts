import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Coach Eli reads his own answers back in this voice by default — pick a
// different one from your ElevenLabs voice library and set
// ELEVENLABS_VOICE_ID if you want something else. "Adam" is a reasonable
// masculine default for a veteran AD.
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export async function POST(req: NextRequest) {
  // middleware.ts already confirmed some valid session (user token or admin
  // cookie) got this far. A resolved user still needs voice_enabled on —
  // admin (no resolvable user via bearer token) is allowed through for
  // testing regardless of any user's toggle.
  const user = await getCurrentUser();
  if (user && !user.voice_enabled) {
    return NextResponse.json({ error: "Voice isn't enabled for your account. Turn it on in your profile." }, { status: 403 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set on this deployment yet." }, { status: 500 });
  }

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
