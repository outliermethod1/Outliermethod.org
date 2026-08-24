import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./prompt";
import { retrieveBylawChunks } from "./retrieval";
import { getState } from "../db/states";
import { searchSchools } from "../db/schools";
import type { BylawChunk } from "../db/types";

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOOL_HOPS = 4;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamResult {
  stream: AsyncIterable<string>;
  retrievedChunks: BylawChunk[];
}

// Anthropic's server-executed web search tool — Claude decides when to call
// it and Anthropic runs the actual search; results stream back as part of
// the same turn, so the client tool-hop loop below never has to handle it
// (only lookup_school, a client-side tool, produces stop_reason "tool_use").
const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 3,
} as unknown as Anthropic.Tool;

const TOOLS: Anthropic.Tool[] = [
  WEB_SEARCH_TOOL,
  {
    name: "lookup_school",
    description:
      "Look up a member school's official classification and district/region within the current state, " +
      "sourced from the state association's own classification list. Use this whenever a specific school " +
      "is named and its classification or district matters to the answer (e.g. classification & scheduling " +
      "questions). Do not guess a school's classification without calling this.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The school name as given by the user, e.g. \"Cherry Creek\"." },
      },
      required: ["name"],
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>, stateCode: string): Promise<unknown> {
  if (name === "lookup_school") {
    const nameQuery = String(input.name ?? "");
    const matches = await searchSchools(stateCode, nameQuery, 5);
    if (matches.length === 0) {
      return { found: false, message: "No school by that name in the directory for this state." };
    }
    return {
      found: true,
      matches: matches.map((m) => ({
        name: m.name,
        city: m.city,
        classification: m.classification,
        district_region: m.district_region,
        sports_sponsored: m.sports_sponsored,
      })),
    };
  }
  return { error: `Unknown tool: ${name}` };
}

export async function runCoachEli(
  stateCode: string,
  history: ChatTurn[],
  opts: { signature?: string | null } = {}
): Promise<StreamResult> {
  const state = await getState(stateCode);
  if (!state) {
    throw new Error(`Unknown state: ${stateCode}`);
  }

  const lastUserMessage = [...history].reverse().find((m) => m.role === "user");
  const chunks = lastUserMessage ? await retrieveBylawChunks(stateCode, lastUserMessage.content) : [];

  const system = buildSystemPrompt(state, chunks, { signature: opts.signature ?? null });

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async function* textStream(): AsyncGenerator<string> {
    let messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const messageStream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 2048,
        system,
        tools: TOOLS,
        messages,
      });

      for await (const event of messageStream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }

      const final = await messageStream.finalMessage();
      if (final.stop_reason !== "tool_use") return;

      const toolUseBlocks = final.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: JSON.stringify(await executeTool(block.name, block.input as Record<string, unknown>, stateCode)),
        }))
      );

      messages = [...messages, { role: "assistant", content: final.content }, { role: "user", content: toolResults }];
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
