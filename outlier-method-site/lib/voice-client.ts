// Browser-side helpers for the two voice features: ElevenLabs playback
// (server-proxied via /api/tts) and native browser speech-to-text for the
// mic input. Both are optional — voice output requires the user's Voice
// toggle plus a server-side ELEVENLABS_API_KEY, and mic input silently
// disables itself in browsers that don't support the Web Speech API
// (notably Firefox).

import { authFetch } from "./auth-client";

export async function fetchSpeech(text: string): Promise<Blob | null> {
  const res = await authFetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return null;
  return res.blob();
}

// The Web Speech API's constructor is vendor-prefixed in Safari/Chrome and
// entirely absent in Firefox — feature-detect rather than assume.
export function getSpeechRecognitionCtor(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}
