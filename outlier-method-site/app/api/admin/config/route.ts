import { NextRequest, NextResponse } from "next/server";
import { listStates, upsertState } from "@/lib/db/states";
import { addWatchedUrl, listWatchedUrls } from "@/lib/db/watched-urls";

export const dynamic = "force-dynamic";

export async function GET() {
  const [states, watchedUrls] = await Promise.all([listStates(), listWatchedUrls()]);
  return NextResponse.json({ states, watchedUrls });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.kind === "state") {
    const state = await upsertState({
      state_code: body.state_code,
      state_name: body.state_name,
      association_name: body.association_name,
      eligibility_contact_name: body.eligibility_contact_name ?? null,
      eligibility_contact_phone: body.eligibility_contact_phone ?? null,
      eligibility_contact_email: body.eligibility_contact_email ?? null,
      level: body.level === "college" ? "college" : "high_school",
    });
    return NextResponse.json({ state });
  }

  if (body.kind === "watched_url") {
    const url = await addWatchedUrl(body.state_code, body.url, body.label);
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
