import { query } from "../db/client";
import type { BylawChunk } from "../db/types";
import { embedText, embeddingsAvailable, toVectorLiteral } from "./embeddings";

const TOP_K = 8;

/**
 * Retrieve the bylaw chunks that ground a Mode A answer.
 *
 * state_code is applied as a hard SQL filter before any similarity search —
 * the model never sees, and can never retrieve, another state's bylaws.
 * Superseded chunks are excluded by default; superseded text must never be
 * cited as current.
 */
export async function retrieveBylawChunks(
  stateCode: string,
  userQuestion: string
): Promise<BylawChunk[]> {
  const state = stateCode.toLowerCase();

  // Keyword pass: catches direct section-number citations ("1730.3") that a
  // vector search can under-rank.
  const keywordMatches = await query<BylawChunk & { rank: number }>(
    `select *, 1.0 as rank from bylaw_chunks
     where state_code = $1 and superseded_by is null
       and (bylaw_id ilike '%' || $2 || '%' or title ilike '%' || $2 || '%')
     limit $3`,
    [state, extractLikelySectionToken(userQuestion) ?? "", TOP_K]
  );

  let vectorMatches: BylawChunk[] = [];
  if (embeddingsAvailable()) {
    const embedding = await embedText(userQuestion, "query");
    if (embedding) {
      vectorMatches = await query<BylawChunk>(
        `select * from (
           select *, embedding <=> $2 as distance from bylaw_chunks
           where state_code = $1 and superseded_by is null and embedding is not null
         ) sub
         order by distance asc
         limit $3`,
        [state, toVectorLiteral(embedding), TOP_K]
      );
    }
  }

  if (vectorMatches.length === 0 && keywordMatches.length === 0) {
    // Last resort: plain full-text-ish match on body so a state with no
    // embeddings configured still gets something better than nothing.
    vectorMatches = await query<BylawChunk>(
      `select * from bylaw_chunks
       where state_code = $1 and superseded_by is null and body ilike '%' || $2 || '%'
       limit $3`,
      [state, userQuestion.slice(0, 60), TOP_K]
    );
  }

  const byId = new Map<string, BylawChunk>();
  for (const c of [...keywordMatches, ...vectorMatches]) byId.set(c.id, c);
  return Array.from(byId.values()).slice(0, TOP_K);
}

function extractLikelySectionToken(q: string): string | null {
  const match = q.match(/\b\d{2,4}(\.\d{1,2})?\b/);
  return match ? match[0] : null;
}

/**
 * Reconstruct the index as it stood on a prior date — a determination made
 * months ago may be challenged, and we need to show what the bylaws said then.
 */
export async function resolveAsOf(stateCode: string, asOfDate: string): Promise<BylawChunk[]> {
  return query<BylawChunk>(
    `select distinct on (bylaw_id) *
     from bylaw_chunks
     where state_code = $1
       and effective_date <= $2
       and (superseded_by is null or superseded_by not in (
         select id from bylaw_chunks where effective_date <= $2
       ))
     order by bylaw_id, effective_date desc`,
    [stateCode.toLowerCase(), asOfDate]
  );
}
