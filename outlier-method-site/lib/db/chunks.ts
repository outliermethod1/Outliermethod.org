import { query, queryOne } from "./client";
import type { BylawChunk, Category } from "./types";

export async function getChunkById(id: string): Promise<BylawChunk | null> {
  return queryOne<BylawChunk>(`select * from bylaw_chunks where id = $1`, [id]);
}

export async function getChunksByIds(ids: string[]): Promise<BylawChunk[]> {
  if (ids.length === 0) return [];
  return query<BylawChunk>(`select * from bylaw_chunks where id = any($1)`, [ids]);
}

export interface NewChunk {
  state_code: string;
  document_id: string | null;
  bylaw_id: string;
  title: string;
  body: string;
  effective_date: string;
  source_doc: string;
  source_page?: number | null;
  category: Category;
  embedding?: number[] | null;
}

/** Insert a new chunk version and mark the prior current chunk with the same
 * bylaw_id as superseded. Amendments supersede — they never overwrite or delete. */
export async function insertChunkAndSupersede(chunk: NewChunk): Promise<string> {
  const embeddingLiteral = chunk.embedding ? `[${chunk.embedding.join(",")}]` : null;

  const inserted = await queryOne<{ id: string }>(
    `insert into bylaw_chunks
       (state_code, document_id, bylaw_id, title, body, effective_date, source_doc, source_page, category, embedding)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning id`,
    [
      chunk.state_code.toLowerCase(),
      chunk.document_id,
      chunk.bylaw_id,
      chunk.title,
      chunk.body,
      chunk.effective_date,
      chunk.source_doc,
      chunk.source_page ?? null,
      chunk.category,
      embeddingLiteral,
    ]
  );
  if (!inserted) throw new Error("Failed to insert chunk");

  await query(
    `update bylaw_chunks set superseded_by = $1
     where state_code = $2 and bylaw_id = $3 and superseded_by is null and id != $1`,
    [inserted.id, chunk.state_code.toLowerCase(), chunk.bylaw_id]
  );

  return inserted.id;
}

/** All current (non-superseded) chunks for a state, for the public bylaw library. */
export async function listCurrentChunksForState(stateCode: string): Promise<BylawChunk[]> {
  return query<BylawChunk>(
    `select * from bylaw_chunks
     where state_code = $1 and superseded_by is null
     order by category, bylaw_id`,
    [stateCode.toLowerCase()]
  );
}

export interface StateIndexHealth {
  state_code: string;
  chunk_count: number;
  current_chunk_count: number;
  most_recent_effective_date: string | null;
}

export async function indexHealthByState(): Promise<StateIndexHealth[]> {
  return query<StateIndexHealth>(
    `select
       s.state_code,
       count(c.id) filter (where c.id is not null) as chunk_count,
       count(c.id) filter (where c.superseded_by is null) as current_chunk_count,
       max(c.effective_date) as most_recent_effective_date
     from states s
     left join bylaw_chunks c on c.state_code = s.state_code
     group by s.state_code
     order by s.state_code`
  );
}
