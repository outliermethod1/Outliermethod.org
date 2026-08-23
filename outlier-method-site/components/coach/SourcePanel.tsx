"use client";

import { useEffect, useState } from "react";

interface ChunkDetail {
  id: string;
  bylaw_id: string;
  title: string;
  body: string;
  effective_date: string;
  source_doc: string;
  source_page: number | null;
  category: string;
}

export function SourcePanel({ chunkId, onClose }: { chunkId: string; onClose: () => void }) {
  const [chunk, setChunk] = useState<ChunkDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChunk(null);
    setError(null);
    fetch(`/api/chunks/${chunkId}`)
      .then((r) => r.json())
      .then((d) => (d.chunk ? setChunk(d.chunk) : setError("Not found")))
      .catch(() => setError("Failed to load source"));
  }, [chunkId]);

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-rule bg-white shadow-[-4px_0_0_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <span className="eyebrow text-red">Bylaw source</span>
        <button onClick={onClose} className="text-slate hover:text-ink" aria-label="Close">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {error && <p className="text-sm text-slate">{error}</p>}
        {chunk && (
          <>
            <h2 className="font-serif text-xl font-semibold text-navy-900">
              {chunk.bylaw_id} &mdash; {chunk.title}
            </h2>
            <p className="mt-1 text-[13px] text-slate">Effective {chunk.effective_date}</p>
            <blockquote className="bylaw-quote mt-5 whitespace-pre-wrap text-ink">{chunk.body}</blockquote>
            <a
              href={chunk.source_doc}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block border border-navy-900 px-4 py-2 text-[13px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white"
            >
              Open source PDF{chunk.source_page ? ` — page ${chunk.source_page}` : ""}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
