import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const MARGIN = 54;
const PAGE_SIZE: [number, number] = [612, 792];

// pdf-lib's standard fonts use WinAnsi encoding, which doesn't cover every
// Unicode punctuation mark a template might contain (typographic minus,
// smart quotes, etc.) — sanitize to the closest WinAnsi-safe character
// instead of letting drawText throw on an unencodable code point.
function toWinAnsiSafe(text: string): string {
  return text
    .replace(/[−–—]/g, "-") // minus sign, en dash, em dash
    .replace(/[‘’]/g, "'") // smart single quotes
    .replace(/[“”]/g, '"') // smart double quotes
    .replace(/…/g, "...") // ellipsis
    .replace(/[•●]/g, "-") // bullet points
    .replace(/[^\x00-\xFF]/g, "?"); // anything else outside Latin-1 (WinAnsi's superset)
}

export interface FormExportContext {
  title: string;
  body: string;
  schoolName: string | null;
  signature: string | null;
}

export async function buildFormPdf(ctx: FormExportContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage(PAGE_SIZE);
  let y = PAGE_SIZE[1] - MARGIN;
  const newPage = () => {
    page = doc.addPage(PAGE_SIZE);
    y = PAGE_SIZE[1] - MARGIN;
  };
  const draw = (rawText: string, opts: { size?: number; f?: PDFFont; gapAfter?: number } = {}) => {
    const text = toWinAnsiSafe(rawText);
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const maxWidth = PAGE_SIZE[0] - MARGIN * 2;
    for (const para of text.split("\n")) {
      const words = para.split(" ");
      let current = "";
      const lines: string[] = [];
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (f.widthOfTextAtSize(candidate, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      lines.push(current);
      for (const line of lines) {
        if (y < MARGIN + 40) newPage();
        page.drawText(line, { x: MARGIN, y, size, font: f, color: rgb(0.07, 0.1, 0.14) });
        y -= size * 1.4;
      }
    }
    y -= opts.gapAfter ?? 4;
  };

  draw(ctx.title.toUpperCase(), { size: 14, f: bold, gapAfter: 4 });
  if (ctx.schoolName) draw(ctx.schoolName, { size: 10, gapAfter: 12 });
  draw(ctx.body, { size: 10, gapAfter: 20 });
  draw("_________________________", { size: 10, gapAfter: 2 });
  draw(ctx.signature || "[Your name]", { size: 10 });

  return doc.save();
}

export async function buildFormDocx(ctx: FormExportContext): Promise<Buffer> {
  const bodyParagraphs = ctx.body.split("\n").map(
    (line) => new Paragraph({ children: [new TextRun(line)] })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: ctx.title, heading: HeadingLevel.HEADING_1 }),
          ...(ctx.schoolName ? [new Paragraph({ children: [new TextRun({ text: ctx.schoolName, italics: true })] })] : []),
          new Paragraph({ text: "" }),
          ...bodyParagraphs,
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "_________________________" }),
          new Paragraph({ children: [new TextRun(ctx.signature || "[Your name]")] }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
