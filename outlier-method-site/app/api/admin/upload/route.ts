import { NextRequest, NextResponse } from "next/server";
import { ingestPdf } from "@/lib/ingest/ingest";
import { notifyBylawWatchers } from "@/lib/notifications";

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
  let result;
  try {
    result = await ingestPdf({
      stateCode,
      effectiveDate,
      slug: slug.replace(/[^a-zA-Z0-9-]/g, "-"),
      buffer,
      source: "manual",
    });
  } catch (err) {
    console.error(`Manual upload ingest failed for ${stateCode}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  notifyBylawWatchers(stateCode, result.bylawIds, effectiveDate).catch((err) =>
    console.error("Amendment notification failed:", err)
  );

  return NextResponse.json({ ok: true, ...result });
}
