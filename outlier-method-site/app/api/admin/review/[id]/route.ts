import { NextRequest, NextResponse } from "next/server";
import { getReviewItem, setReviewStatus } from "@/lib/db/review-queue";
import { ingestPdf } from "@/lib/ingest/ingest";
import { notifyBylawWatchers } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { action, effectiveDate } = (await req.json()) as {
    action: "approve" | "reject";
    effectiveDate?: string;
  };

  const item = await getReviewItem(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.status !== "pending") {
    return NextResponse.json({ error: `Already ${item.status}` }, { status: 409 });
  }

  if (action === "reject") {
    await setReviewStatus(params.id, "rejected");
    return NextResponse.json({ ok: true });
  }

  const finalEffectiveDate = effectiveDate ?? new Date().toISOString().slice(0, 10);
  const res = await fetch(item.blob_path);
  if (!res.ok) {
    return NextResponse.json({ error: "Could not fetch staged document from Blob" }, { status: 502 });
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  const result = await ingestPdf({
    stateCode: item.state_code,
    effectiveDate: finalEffectiveDate,
    slug: item.blob_path.split("/").pop()?.replace(/\.pdf$/, "") ?? "amendment",
    buffer,
    source: "crawler",
    watchedUrlId: item.watched_url_id,
  });

  await setReviewStatus(params.id, "approved", finalEffectiveDate);

  // Amendment alerts: notify everyone watching a bylaw this ingestion just
  // superseded. Best-effort — a failed notification never blocks approval.
  notifyBylawWatchers(item.state_code, result.bylawIds, finalEffectiveDate).catch((err) =>
    console.error("Amendment notification failed:", err)
  );

  return NextResponse.json({ ok: true, ...result });
}
