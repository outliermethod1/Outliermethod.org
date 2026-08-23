import { NextRequest, NextResponse } from "next/server";
import { upsertSchools, countSchoolsByState, type NewSchool } from "@/lib/db/schools";

export const dynamic = "force-dynamic";

/** GET returns per-state school counts, for the admin health view. */
export async function GET() {
  return NextResponse.json({ counts: await countSchoolsByState() });
}

/**
 * Accepts CSV text with header: name,city,classification,district_region,sports_sponsored
 * sports_sponsored is a "|"-separated list, e.g. "football|basketball|track".
 * Upserts by (state_code, name) — safe to re-upload an updated list.
 */
export async function POST(req: NextRequest) {
  const { stateCode, csv } = (await req.json()) as { stateCode?: string; csv?: string };
  if (!stateCode || !csv) {
    return NextResponse.json({ error: "stateCode and csv are required" }, { status: 400 });
  }

  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  if (nameIdx === -1) {
    return NextResponse.json({ error: "CSV must have a 'name' column" }, { status: 400 });
  }
  const cityIdx = header.indexOf("city");
  const classIdx = header.indexOf("classification");
  const districtIdx = header.indexOf("district_region");
  const sportsIdx = header.indexOf("sports_sponsored");

  const schools: NewSchool[] = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return {
      state_code: stateCode,
      name: cells[nameIdx] ?? "",
      city: cityIdx >= 0 ? cells[cityIdx] || null : null,
      classification: classIdx >= 0 ? cells[classIdx] || null : null,
      district_region: districtIdx >= 0 ? cells[districtIdx] || null : null,
      sports_sponsored: sportsIdx >= 0 && cells[sportsIdx] ? cells[sportsIdx].split("|").map((s) => s.trim()) : null,
      source: "manual",
    };
  }).filter((s) => s.name.length > 0);

  if (schools.length === 0) {
    return NextResponse.json({ error: "No valid rows found" }, { status: 400 });
  }

  const count = await upsertSchools(schools);
  return NextResponse.json({ ok: true, count });
}
