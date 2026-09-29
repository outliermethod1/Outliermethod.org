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

  for (const item of items) {
    const y = Array.isArray(item.transform) ? Math.round(item.transform[5]) : null;
    if (currentLine && lastY !== null && y !== null && y !== lastY) {
      lines.push(currentLine.trim());
      currentLine = "";
    }
    if (item.str) {
      currentLine += (currentLine && !/\s$/.test(currentLine) ? " " : "") + item.str;
    }
    if (item.hasEOL) {
      lines.push(currentLine.trim());
      currentLine = "";
      lastY = null;
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
      return { id: m.groups.id, title: m.groups.title.trim() };
    }
  }
  return null;
}
