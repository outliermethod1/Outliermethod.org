import { NextRequest, NextResponse } from "next/server";
import { runCrawler } from "@/lib/ingest/crawler";

export const dynamic = "force-dynamic";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runCrawler();
  return NextResponse.json(result);
}
