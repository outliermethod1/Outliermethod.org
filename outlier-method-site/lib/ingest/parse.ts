// Section-aware PDF parsing. Bylaw handbooks are already structured
// documents — we chunk on their own article/section boundaries, never on
// raw token count, so every chunk carries its own citation.

export interface ParsedSection {
  bylaw_id: string;
  title: string;
  body: string;
  page: number;
}

// Matches lines like "1730.3 Transfer Students" or "Rule 17 Section 3 Undue Influence"
// or "Article V — Amateurism". Tuned to be generic across state handbook formats;
// expect to add per-state heading patterns as real documents are onboarded.
const HEADING_PATTERNS = [
  /^(?<id>\d{1,4}(?:\.\d{1,3}){0,2})\s+(?<title>[A-Z][A-Za-z0-9 ,'’\/&()-]{3,90})$/,
  /^(?:Rule|RULE)\s+(?<id>\d{1,3}(?:[.\-]\d{1,3})?)\s*[:\-–]?\s*(?<title>[A-Za-z][A-Za-z0-9 ,'’\/&()-]{3,90})$/,
  /^(?:Article|ARTICLE)\s+(?<id>[IVXLC]+|\d+)\s*[:\-–—]\s*(?<title>[A-Za-z][A-Za-z0-9 ,'’\/&()-]{3,90})$/,
  // "BYLAW 101.00 AGE" / "SECTION 6.2 ELIGIBILITY" / "BY-LAW 3.1 TRANSFERS" /
  // "BYLAW 6. TRANSFER RULE- CITIZENS OF THE U.S. AND D.C." — a word prefix,
  // a numeric id (optionally dotted, optionally followed by a bare period
  // before the title, as KHSAA uses), then an (often all-caps) title that
  // may itself contain periods (state abbreviations) or an en/em dash.
  /^(?:BY-?LAW|SECTION)\s+(?<id>\d{1,4}(?:\.\d{1,3}){0,2})\.?\s+(?<title>[A-Z][A-Za-z0-9 ,.'’"“”\/&()–—-]{2,90})$/i,
  // State-statute citation style, e.g. "SDCL 13-1-57 DEFINITIONS REGARDING..."
  // or "ORS 339.010 TITLE" — a short all-caps code abbreviation, a
  // hyphen-or-dot-separated numeric id, then a title on the same line.
  /^[A-Z]{2,6}\s+(?<id>\d+[A-Z]?(?:[.\-]\d+[A-Z]?){1,3})\s+(?<title>[A-Z][A-Za-z0-9 ,'’\/&()-]{2,90})$/,
];

export async function parsePdf(buffer: Buffer): Promise<{ pages: string[] }> {
  const pdfParse = (await import("pdf-parse")).default;
  const pages: string[] = [];
  await pdfParse(buffer, {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      const text = reconstructLines(textContent.items);
      pages.push(text);
      return text;
    },
  });
  return { pages };
}

// pdf.js text items are individual runs positioned by (x, y), not lines —
// joining them with a plain space (the old approach) collapses an entire
// page into one line with no \n at all, which silently broke
// chunkIntoSections's heading detection below for almost every real-world
// PDF (it only "worked" by coincidence when a document's own text layer
// happened to embed unusual whitespace). Reconstruct actual lines by
// breaking whenever the Y-coordinate changes or pdf.js reports hasEOL.
function reconstructLines(items: any[]): string {
  const lines: string[] = [];
  let currentLine = "";
  let lastY: number | null = null;
  let lastEndX: number | null = null;
  let lastFontScale = 1;

  for (const item of items) {
    const y = Array.isArray(item.transform) ? Math.round(item.transform[5]) : null;
    const x = Array.isArray(item.transform) ? item.transform[4] : null;
    const fontScale = Array.isArray(item.transform) ? Math.abs(item.transform[0]) || 1 : 1;

    if (currentLine && lastY !== null && y !== null && y !== lastY) {
      lines.push(currentLine.trim());
      currentLine = "";
      lastEndX = null;
    }

    if (item.str) {
      // Some PDF generators split a single visual word/number (e.g. a
      // citation like "13-1-57") into several small positioned runs with
      // only a hair of a gap between them — always inserting a space here
      // (the old approach) produced "13 -1- 57" and silently broke every
      // heading pattern expecting a clean id. Only insert a space when the
      // horizontal gap between runs is wide enough to actually be a word
      // boundary, scaled to the current font size.
      let needsSpace = currentLine.length > 0 && !/\s$/.test(currentLine);
      if (needsSpace && x !== null && lastEndX !== null) {
        const gap = x - lastEndX;
        needsSpace = gap > 0.2 * lastFontScale;
      }
      currentLine += (needsSpace ? " " : "") + item.str;
      if (x !== null) {
        const width = typeof item.width === "number" ? item.width : item.str.length * fontScale * 0.5;
        lastEndX = x + width;
      }
      lastFontScale = fontScale;
    }

    if (item.hasEOL) {
      lines.push(currentLine.trim());
      currentLine = "";
      lastY = null;
      lastEndX = null;
    } else {
      lastY = y;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines.filter(Boolean).join("\n");
}

export function chunkIntoSections(pages: string[]): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  pages.forEach((pageText, pageIdx) => {
    const lines = pageText
      .split(/\n|(?<=\.)\s{2,}/)
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const heading = matchHeading(line);
      if (heading) {
        if (current) sections.push(current);
        current = { bylaw_id: heading.id, title: heading.title, body: "", page: pageIdx + 1 };
      } else if (current) {
        current.body += (current.body ? " " : "") + line;
      }
    }
  });
  if (current) sections.push(current);

  return sections.filter((s) => s.body.trim().length > 20);
}

function matchHeading(line: string): { id: string; title: string } | null {
  for (const pattern of HEADING_PATTERNS) {
    const m = line.match(pattern);
    if (m?.groups?.id && m.groups.title) {
      const title = m.groups.title.trim();
      // A table-of-contents dot-leader line ("Section 1. Dues .......... 4")
      // otherwise matches this same pattern once "." is allowed in titles
      // (for real abbreviations like "U.S."/"D.C.") — a run of 2+ dots is
      // never a real title, only ever a TOC leader, so reject it.
      if (title.includes("..")) continue;
      return { id: m.groups.id, title };
    }
  }
  return null;
}
