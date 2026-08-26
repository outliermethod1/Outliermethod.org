import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { Conversation, Message } from "../db/types";
import type { BylawChunk, StateConfig } from "../db/types";
import { DISCLAIMER_BODY } from "../disclaimer";

const MARGIN = 54;
const PAGE_SIZE: [number, number] = [612, 792]; // US Letter

// pdf-lib's standard fonts use WinAnsi encoding — doesn't cover every
// Unicode punctuation mark Eli's own answers use (em dashes especially),
// so sanitize before drawing instead of letting drawText throw.
function toWinAnsiSafe(text: string): string {
  return text
    .replace(/[−–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[•●]/g, "-")
    .replace(/[^\x00-\xFF]/g, "?");
}

interface ExportContext {
  conversation: Conversation;
  messages: Message[];
  state: StateConfig;
  chunksByMessageId: Map<string, BylawChunk[]>;
}

function makeDrawer(doc: PDFDocument, font: PDFFont) {
  let page = doc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;

  const newPage = () => {
    page = doc.addPage(PAGE_SIZE);
    y = PAGE_SIZE[1] - MARGIN;
  };

  const draw = (
    rawText: string,
    opts: { size?: number; f?: PDFFont; color?: [number, number, number]; gapAfter?: number } = {}
  ) => {
    const text = toWinAnsiSafe(rawText);
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const color = opts.color ? rgb(...opts.color) : rgb(0.07, 0.1, 0.14);
    const maxWidth = PAGE_SIZE[0] - MARGIN * 2;
    const lines = wrapText(text, f, size, maxWidth);
    for (const line of lines) {
      if (y < MARGIN + 40) newPage();
      page.drawText(line, { x: MARGIN, y, size, font: f, color });
      y -= size * 1.4;
    }
    y -= opts.gapAfter ?? 4;
  };

  return { draw, newPage };
}

export async function buildConversationPdf(ctx: ExportContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const { draw } = makeDrawer(doc, font);

  draw("AD CHIEF OF STAFF — CONVERSATION RECORD", { size: 14, f: bold });
  draw(`${ctx.state.association_name} (${ctx.state.state_name})`, { size: 10, f: italic, gapAfter: 2 });
  draw(`Exported ${new Date().toISOString()}`, { size: 9, f: italic, color: [0.35, 0.4, 0.46], gapAfter: 12 });

  for (const message of ctx.messages) {
    const label = message.role === "user" ? "AD ASKED" : "COACH ELI";
    draw(label, { size: 9, f: bold, color: [0.66, 0.14, 0.18], gapAfter: 2 });
    draw(stripCiteMarkers(message.content), { size: 10, gapAfter: 8 });

    const chunks = ctx.chunksByMessageId.get(message.id) ?? [];
    for (const chunk of chunks) {
      draw(`${chunk.bylaw_id} — ${chunk.title} (effective ${chunk.effective_date})`, {
        size: 9,
        f: bold,
        gapAfter: 2,
      });
      draw(chunk.body, { size: 9, f: italic, color: [0.3, 0.34, 0.4], gapAfter: 8 });
    }
  }

  draw("", { gapAfter: 6 });
  draw("GUIDANCE, NOT A RULING", { size: 9, f: bold, gapAfter: 2 });
  draw(DISCLAIMER_BODY, { size: 9, f: italic, color: [0.35, 0.4, 0.46], gapAfter: 8 });
  draw(
    `${ctx.state.association_name} eligibility contact: ${ctx.state.eligibility_contact_name ?? "—"} · ${ctx.state.eligibility_contact_phone ?? "—"} · ${ctx.state.eligibility_contact_email ?? "—"}`,
    { size: 9, f: bold }
  );

  return doc.save();
}

export interface MemoContext {
  question: string;
  answer: string;
  state: StateConfig;
  chunks: BylawChunk[];
  createdAt: string;
  integrityHash: string;
}

/** The single highest-value export: one exchange, forwardable to a principal,
 *  parent, or superintendent as proof of exactly what rule was relied on and
 *  when it was checked. */
export async function buildEligibilityMemoPdf(ctx: MemoContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const { draw } = makeDrawer(doc, font);

  draw("ELIGIBILITY MEMO", { size: 16, f: bold, gapAfter: 2 });
  draw(`${ctx.state.association_name} (${ctx.state.state_name})`, { size: 10, f: italic, gapAfter: 2 });
  draw(
    `Checked ${new Date(ctx.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}`,
    { size: 9, f: italic, color: [0.35, 0.4, 0.46], gapAfter: 14 }
  );

  draw("QUESTION ASKED", { size: 9, f: bold, color: [0.66, 0.14, 0.18], gapAfter: 2 });
  draw(ctx.question, { size: 10, gapAfter: 12 });

  draw("ANSWER", { size: 9, f: bold, color: [0.66, 0.14, 0.18], gapAfter: 2 });
  draw(stripCiteMarkers(ctx.answer), { size: 10, gapAfter: 12 });

  if (ctx.chunks.length > 0) {
    draw("BYLAWS RELIED ON", { size: 9, f: bold, color: [0.66, 0.14, 0.18], gapAfter: 4 });
    for (const chunk of ctx.chunks) {
      draw(`${chunk.bylaw_id} — ${chunk.title} (effective ${chunk.effective_date})`, {
        size: 9,
        f: bold,
        gapAfter: 2,
      });
      draw(chunk.body, { size: 9, f: italic, color: [0.3, 0.34, 0.4], gapAfter: 4 });
      draw(chunk.source_doc, { size: 8, color: [0.5, 0.55, 0.6], gapAfter: 10 });
    }
  }

  draw("", { gapAfter: 6 });
  draw(
    `Guidance based on the cited bylaw as of ${new Date(ctx.createdAt).toISOString().slice(0, 10)}; not a ruling by ${ctx.state.association_name}. Not legal advice.`,
    { size: 9, f: italic, color: [0.35, 0.4, 0.46], gapAfter: 8 }
  );
  draw(
    `${ctx.state.association_name} eligibility contact: ${ctx.state.eligibility_contact_name ?? "—"} · ${ctx.state.eligibility_contact_phone ?? "—"} · ${ctx.state.eligibility_contact_email ?? "—"}`,
    { size: 9, f: bold, gapAfter: 10 }
  );
  draw(`Integrity hash (SHA-256): ${ctx.integrityHash}`, { size: 7, f: font, color: [0.6, 0.63, 0.67] });

  return doc.save();
}

function stripCiteMarkers(text: string): string {
  return text.replace(/\[\[cite:[a-f0-9-]+\]\]/g, "").replace(/\s{2,}/g, " ").trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}
