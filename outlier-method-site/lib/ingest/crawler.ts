import { put } from "@vercel/blob";
import { listWatchedUrls, recordCheckResult } from "../db/watched-urls";
import { addReviewItem } from "../db/review-queue";
import { addCrawlerAlert } from "../db/documents";
import { hashBuffer } from "./ingest";

const STALE_THRESHOLD_CHECKS = 90; // ~90 daily checks with no change is worth a human glance
const FAILURE_ALERT_THRESHOLD = 1; // any 404 alerts immediately — silent breakage must surface fast

/**
 * The crawler never publishes. It only detects change and, when found, files
 * a review-queue entry with a diff for a human to approve. Approval is what
 * triggers ingestPdf() and the index re-resolve.
 */
export async function runCrawler(): Promise<{ checked: number; changed: number; alerts: number }> {
  const urls = await listWatchedUrls();
  let changed = 0;
  let alerts = 0;

  for (const watched of urls) {
    try {
      const res = await fetch(watched.url, { redirect: "follow" });

      if (res.status === 404) {
        await recordCheckResult(watched.id, { status: "error_404", changed: false });
        await addCrawlerAlert({
          watched_url_id: watched.id,
          state_code: watched.state_code,
          kind: "404",
          message: `Watched URL returned 404: ${watched.url}`,
        });
        alerts++;
        continue;
      }
      if (!res.ok) {
        await recordCheckResult(watched.id, { status: "error_other", changed: false });
        if (watched.consecutive_failures + 1 >= FAILURE_ALERT_THRESHOLD) {
          await addCrawlerAlert({
            watched_url_id: watched.id,
            state_code: watched.state_code,
            kind: "error",
            message: `Watched URL returned HTTP ${res.status}: ${watched.url}`,
          });
          alerts++;
        }
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const contentHash = hashBuffer(buffer);

      if (contentHash === watched.content_hash) {
        await recordCheckResult(watched.id, { status: "unchanged", changed: false });
        if (watched.consecutive_unchanged_checks + 1 >= STALE_THRESHOLD_CHECKS) {
          await addCrawlerAlert({
            watched_url_id: watched.id,
            state_code: watched.state_code,
            kind: "stale",
            message: `No change detected at ${watched.url} in ${STALE_THRESHOLD_CHECKS}+ checks — verify the source is still live and correct.`,
          });
          alerts++;
        }
        continue;
      }

      // Content changed. Stage it in Blob and file a review-queue entry —
      // never touch bylaw_chunks directly here.
      const stagingPath = `bylaws/${watched.state_code}/pending-${Date.now()}-${slugFromUrl(watched.url)}.pdf`;
      const blob = await put(stagingPath, buffer, { access: "public", addRandomSuffix: false });

      await addReviewItem({
        state_code: watched.state_code,
        watched_url_id: watched.id,
        blob_path: blob.url,
        content_hash: contentHash,
        diff_summary: watched.content_hash
          ? `Content changed at ${watched.label} (${watched.url}). Previous hash ${watched.content_hash.slice(0, 12)}… → new hash ${contentHash.slice(0, 12)}…`
          : `First fetch of ${watched.label} (${watched.url}).`,
      });

      await recordCheckResult(watched.id, { status: "ok", contentHash, changed: true });
      changed++;
    } catch (err) {
      await recordCheckResult(watched.id, { status: "error_other", changed: false });
      await addCrawlerAlert({
        watched_url_id: watched.id,
        state_code: watched.state_code,
        kind: "error",
        message: `Fetch failed for ${watched.url}: ${err instanceof Error ? err.message : String(err)}`,
      });
      alerts++;
    }
  }

  return { checked: urls.length, changed, alerts };
}

function slugFromUrl(url: string): string {
  const last = url.split("/").filter(Boolean).pop() ?? "document";
  return last.replace(/\.[a-zA-Z0-9]+$/, "").replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 60);
}
