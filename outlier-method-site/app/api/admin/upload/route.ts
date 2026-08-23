import { NextRequest, NextResponse } from "next/server";
import { ingestPdf } from "@/lib/ingest/ingest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const stateCode = formData.get("stateCode") as string | null;
  const effectiveDate = formData.get("effectiveDate") as string | null;
  const slug = (formData.get("slug") as string | null) || "handbook";

  if (!file || !stateCode || !effectiveDate) {
    return NextResponse.json({ error: "file, stateCode, and effectiveDate are required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await ingestPdf({
    stateCode,
    effectiveDate,
    slug: slug.replace(/[^a-zA-Z0-9-]/g, "-"),
    buffer,
    source: "manual",
  });

  return NextResponse.json({ ok: true, ...result });
}
