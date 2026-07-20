import { NextResponse } from "next/server";
import {
  buildSystemPrompt,
  callGuideModel,
  ACTIVITY_FIELD_KNOWLEDGE,
  SAFETY_HARD_RULE,
} from "../../../lib/guidePrompts";

/* ============================================================
   TRIP WEATHER READ — API route.
   Takes a forecast summary for a trip-planner activity and
   returns a short, in-character read from Amos or Eleanor.
   Live answers via the xAI API. Set XAI_API_KEY in
   Vercel → Project → Settings → Environment Variables.
   Never hardcode the key.
============================================================ */

const ACTIVITY_PERSONA = {
  hunting: "amos",
  fishing: "amos",
  camping: "eleanor",
  hiking: "eleanor",
};

const NO_KEY_ANSWER =
  "The full trip read is still getting its boots on — meanwhile, use the forecast " +
  "above and always double check official conditions before you head out.";

const FALLBACK_ANSWER =
  "Couldn't pull a read together just now — the forecast above is still solid, " +
  "just verify conditions with official sources before you go.";

const MAX_LOCATION_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 2000;

export async function POST(request) {
  const body = await request.json();
  const activity = typeof body.activity === "string" ? body.activity : "";
  const location = typeof body.location === "string" ? body.location.slice(0, MAX_LOCATION_LENGTH) : "";
  const forecastSummary =
    typeof body.forecastSummary === "string" ? body.forecastSummary.slice(0, MAX_SUMMARY_LENGTH) : "";

  const persona = ACTIVITY_PERSONA[activity];

  if (!persona || !forecastSummary) {
    return NextResponse.json({ answer: "Need a location and forecast first." }, { status: 400 });
  }

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ answer: NO_KEY_ANSWER });
  }

  const systemPrompt = buildSystemPrompt(persona, [ACTIVITY_FIELD_KNOWLEDGE[activity], SAFETY_HARD_RULE]);

  const userMessage = `Activity: ${activity}\nLocation: ${location || "not specified"}\nForecast:\n${forecastSummary}\n\nGive your read on these conditions for this activity.`;

  try {
    const answer = await callGuideModel(systemPrompt, [{ role: "user", content: userMessage }]);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("xAI API error", err);
    return NextResponse.json({ answer: FALLBACK_ANSWER });
  }
}
