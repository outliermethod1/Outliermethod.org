import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./prompt";
import { retrieveBylawChunks } from "./retrieval";
import { getState } from "../db/states";
import { searchSchools } from "../db/schools";
import { createUserDeadline } from "../db/deadlines";
import type { BylawChunk } from "../db/types";

const MODEL = "claude-sonnet-5";
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
  type: "web_search_20260209", // dynamic-filtering variant — Sonnet 5 supports it
  name: "web_search",
  max_uses: 3,
} as unknown as Anthropic.Tool;

const LOOKUP_SCHOOL_TOOL: Anthropic.Tool = {
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
};

const SAVE_DEADLINE_TOOL: Anthropic.Tool = {
  name: "save_deadline",
  description:
    "Save a concrete, dated deadline to the user's personal compliance calendar. Call this whenever you " +
    "state a specific date or a clearly calculable one (e.g. 'you have until March 1st', 'the window closes " +
    "10 school days after enrollment' once you and the user have worked out the actual date) that the user " +
    "would want tracked and reminded about — a hardship petition deadline, a transfer eligibility window " +
    "closing, a classification appeal deadline, an officials certification renewal, etc. Do not call this for " +
    "vague or hypothetical dates, or ones you haven't actually stated to the user in this answer.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short label, e.g. \"Hardship petition deadline — Jordan Ellis\"." },
      due_date: { type: "string", description: "ISO date, YYYY-MM-DD." },
      description: { type: "string", description: "One or two sentences of context, e.g. which bylaw and why." },
    },
    required: ["title", "due_date"],
  },
};

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  stateCode: string,
  userId: string | null
): Promise<unknown> {
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
  if (name === "save_deadline") {
    if (!userId) {
      return { saved: false, message: "No logged-in user to save this to — mention they can save it once they have an account." };
    }
    const title = String(input.title ?? "").slice(0, 200);
    const dueDate = String(input.due_date ?? "");
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return { saved: false, message: "Missing or malformed title/due_date." };
    }
    await createUserDeadline(userId, title, (input.description as string) ?? null, dueDate, null);
    return { saved: true };
  }
  return { error: `Unknown tool: ${name}` };
}

export async function runCoachEli(
  stateCode: string,
  history: ChatTurn[],
  opts: { signature?: string | null; userId?: string | null } = {}
): Promise<StreamResult> {
  const state = await getState(stateCode);
  if (!state) {
    throw new Error(`Unknown state: ${stateCode}`);
  }

  const lastUserMessage = [...history].reverse().find((m) => m.role === "user");
  const chunks = lastUserMessage ? await retrieveBylawChunks(stateCode, lastUserMessage.content) : [];

  const userId = opts.userId ?? null;
  const system = buildSystemPrompt(state, chunks, { signature: opts.signature ?? null, hasAccount: !!userId });

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // save_deadline only makes sense for a real logged-in user — an anonymous
  // visitor or admin session has no personal calendar to save into.
  const tools: Anthropic.Tool[] = userId
    ? [WEB_SEARCH_TOOL, LOOKUP_SCHOOL_TOOL, SAVE_DEADLINE_TOOL]
    : [WEB_SEARCH_TOOL, LOOKUP_SCHOOL_TOOL];

  async function* textStream(): AsyncGenerator<string> {
    let messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const messageStream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 2048,
        system,
        tools,
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
          content: JSON.stringify(
            await executeTool(block.name, block.input as Record<string, unknown>, stateCode, userId)
          ),
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
