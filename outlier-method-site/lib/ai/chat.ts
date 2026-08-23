import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./prompt";
import { retrieveBylawChunks } from "./retrieval";
import { getState } from "../db/states";
import type { BylawChunk } from "../db/types";

const MODEL = "claude-sonnet-4-5-20250929";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamResult {
  stream: AsyncIterable<string>;
  retrievedChunks: BylawChunk[];
}

export async function runCoachEli(stateCode: string, history: ChatTurn[]): Promise<StreamResult> {
  const state = await getState(stateCode);
  if (!state) {
    throw new Error(`Unknown state: ${stateCode}`);
  }

  const lastUserMessage = [...history].reverse().find((m) => m.role === "user");
  const chunks = lastUserMessage ? await retrieveBylawChunks(stateCode, lastUserMessage.content) : [];

  const system = buildSystemPrompt(state, chunks);

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messageStream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  async function* textStream() {
    for await (const event of messageStream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }

  return { stream: textStream(), retrievedChunks: chunks };
}

/** Extract [[cite:CHUNK_ID]] markers from a finished answer, in order of appearance. */
export function extractCitedChunkIds(text: string): string[] {
  const ids: string[] = [];
  const re = /\[\[cite:([a-f0-9-]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) ids.push(m[1]);
  return Array.from(new Set(ids));
}
