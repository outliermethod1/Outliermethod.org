import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Conversation, Message } from "../db/types";
import type { BylawChunk, StateConfig } from "../db/types";
import { DISCLAIMER_BODY } from "../disclaimer";

const MARGIN = 54;
const PAGE_SIZE: [number, number] = [612, 792]; // US Letter

interface ExportContext {
  conversation: Conversation;
  messages: Message[];
  state: StateConfig;
  chunksByMessageId: Map<string, BylawChunk[]>;
}

export async function buildConversationPdf(ctx: ExportContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page = doc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;

  const newPage = () => {
    page = doc.addPage(PAGE_SIZE);
    y = PAGE_SIZE[1] - MARGIN;
  };

  const draw = (
    text: string,
    opts: { size?: number; f?: typeof font; color?: [number, number, number]; gapAfter?: number } = {}
  ) => {
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

  y -= 10;
  draw("GUIDANCE, NOT A RULING", { size: 9, f: bold, gapAfter: 2 });
  draw(DISCLAIMER_BODY, { size: 9, f: italic, color: [0.35, 0.4, 0.46], gapAfter: 8 });
  draw(
    `${ctx.state.association_name} eligibility contact: ${ctx.state.eligibility_contact_name ?? "—"} · ${ctx.state.eligibility_contact_phone ?? "—"} · ${ctx.state.eligibility_contact_email ?? "—"}`,
    { size: 9, f: bold }
  );

  return doc.save();
}

function stripCiteMarkers(text: string): string {
  return text.replace(/\[\[cite:[a-f0-9-]+\]\]/g, "").replace(/\s{2,}/g, " ").trim();
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
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
