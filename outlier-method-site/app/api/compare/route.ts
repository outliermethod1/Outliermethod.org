import { NextRequest, NextResponse } from "next/server";
import { runCoachEli, extractCitedChunkIds } from "@/lib/ai/chat";
import { getChunksByIds } from "@/lib/db/chunks";
import { getState } from "@/lib/db/states";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveIdentity } from "@/lib/request-identity";
import { getCurrentUser } from "@/lib/current-user";
import { isPaidOrFounding } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// The hardest eligibility case — a student moving between two states — with
// no good existing tool. Non-streaming: runs both states' full answers in
// parallel and returns them together for a side-by-side read. Requires an
// account (not the free anonymous quota) since it burns two model calls at once.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`compare:${ip}`);
  if (!allowed) return NextResponse.json({ error: "Slow down a beat." }, { status: 429 });

  const identity = await resolveIdentity(req);
  if (!identity.userId && !identity.isAdmin) {
    return NextResponse.json({ error: "Log in to compare states." }, { status: 401 });
  }
  const currentUser = identity.userId ? await getCurrentUser() : null;
  if (currentUser && !isPaidOrFounding(currentUser)) {
    return NextResponse.json(
      { error: "Multi-state comparison is a paid feature — see /pricing." },
      { status: 403 }
    );
  }

  const { stateCodeA, stateCodeB, question } = (await req.json()) as {
    stateCodeA?: string;
    stateCodeB?: string;
    question?: string;
  };
  if (!stateCodeA || !stateCodeB || !question?.trim()) {
    return NextResponse.json({ error: "stateCodeA, stateCodeB, and question are required." }, { status: 400 });
  }

  const [stateA, stateB] = await Promise.all([getState(stateCodeA), getState(stateCodeB)]);
  if (!stateA || !stateB) return NextResponse.json({ error: "Unknown state" }, { status: 400 });

  async function runOne(stateCode: string) {
    const { stream, retrievedChunks } = await runCoachEli(stateCode, [{ role: "user", content: question! }], {
      signature: currentUser?.signature ?? null,
      userId: identity.userId,
    });
    let text = "";
    for await (const delta of stream) text += delta;
    const citedIds = extractCitedChunkIds(text);
    const chunks = await getChunksByIds(citedIds);
    return {
      answer: text.replace(/\[\[cite:[a-f0-9-]+\]\]/g, ""),
      chunks: citedIds.map((id) => chunks.find((c) => c.id === id)).filter(Boolean),
      retrievedCount: retrievedChunks.length,
    };
  }

  const [resultA, resultB] = await Promise.all([runOne(stateCodeA), runOne(stateCodeB)]);

  return NextResponse.json({
    stateA: { code: stateCodeA, name: stateA.state_name, association: stateA.association_name, ...resultA },
    stateB: { code: stateCodeB, name: stateB.state_name, association: stateB.association_name, ...resultB },
  });
}
