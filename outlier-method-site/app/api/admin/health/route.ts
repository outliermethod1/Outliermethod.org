import { NextResponse } from "next/server";
import { indexHealthByState } from "@/lib/db/chunks";
import { listWatchedUrls } from "@/lib/db/watched-urls";
import { listUnacknowledgedAlerts } from "@/lib/db/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  const [health, watchedUrls, alerts] = await Promise.all([
    indexHealthByState(),
    listWatchedUrls(),
    listUnacknowledgedAlerts(),
  ]);
  return NextResponse.json({ health, watchedUrls, alerts });
}
