import { NextResponse } from "next/server";
import { listStates } from "@/lib/db/states";
import { indexHealthByState } from "@/lib/db/chunks";

export const dynamic = "force-dynamic";

// Honest coverage labeling: a state whose bylaw corpus is still empty
// shouldn't present as fully covered just because it's configured. See
// CLAUDE.md gotcha #22 — a half-built feature must not present as finished.
export async function GET() {
  const [states, health] = await Promise.all([listStates(), indexHealthByState()]);
  const healthByCode = Object.fromEntries(health.map((h) => [h.state_code, h]));

  return NextResponse.json({
    states: states.map((s) => ({
      ...s,
      covered: (healthByCode[s.state_code]?.current_chunk_count ?? 0) > 0,
      chunk_count: healthByCode[s.state_code]?.current_chunk_count ?? 0,
      most_recent_effective_date: healthByCode[s.state_code]?.most_recent_effective_date ?? null,
    })),
  });
}
