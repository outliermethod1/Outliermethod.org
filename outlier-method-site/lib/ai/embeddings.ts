// Embeddings via Voyage AI (Anthropic's recommended embedding partner — Claude
// itself has no embeddings endpoint). Optional: retrieval falls back to
// keyword-only search when VOYAGE_API_KEY is unset.

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-2"; // 1024-dim, matches migrations/001_init.sql

export function embeddingsAvailable(): boolean {
  return !!process.env.VOYAGE_API_KEY;
}

export async function embedText(text: string, inputType: "query" | "document"): Promise<number[] | null> {
  return (await embedTexts([text], inputType))[0] ?? null;
}

export async function embedTexts(
  texts: string[],
  inputType: "query" | "document"
): Promise<(number[] | null)[]> {
  if (!process.env.VOYAGE_API_KEY || texts.length === 0) {
    return texts.map(() => null);
  }

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: MODEL, input_type: inputType }),
  });

  if (!res.ok) {
    console.error("Voyage embeddings request failed", res.status, await res.text());
    return texts.map(() => null);
  }

  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
