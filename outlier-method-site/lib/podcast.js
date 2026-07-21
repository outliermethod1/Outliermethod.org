/* ============================================================
   PODCAST — fetches and parses the live show RSS feed.
   Feed URL confirmed via the show's Spotify for Podcasters
   distribution (mirrors the standard anchor.fm/s/<id>/podcast/rss
   pattern). No XML parsing dependency is installed in this
   project, so items are pulled out with regex — the feed is a
   small, well-formed, single-source RSS doc, not arbitrary user
   input, so this is a reasonable trade against adding a new
   dependency that can't be installed from this environment.
============================================================ */

const FEED_URL = "https://anchor.fm/s/10b25f358/podcast/rss";
const REVALIDATE_SECONDS = 3600; // once an hour — stay current without hammering the feed

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(re);
  if (!match) return "";

  let value = match[1].trim();
  const cdata = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) value = cdata[1].trim();
  return value;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'");
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(str, max = 160) {
  if (str.length <= max) return str;
  return `${str.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export async function getPodcastEpisodes() {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];

    const xml = await res.text();
    const itemBlocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || [];

    const episodes = itemBlocks.map((block) => {
      const title = stripHtml(decodeEntities(extractTag(block, "title")));
      const link = extractTag(block, "link");
      const pubDate = extractTag(block, "pubDate");
      const rawDescription = extractTag(block, "itunes:summary") || extractTag(block, "description");
      // itunes:summary is HTML-entity-encoded (e.g. "&lt;p&gt;"), so entities
      // must be decoded before stripping tags — otherwise decoding runs after
      // stripHtml and re-introduces literal <p> tags into the output.
      const description = truncate(stripHtml(decodeEntities(rawDescription)));

      return { title, link, pubDate, description };
    });

    return episodes
      .filter((ep) => ep.title)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  } catch {
    // Feed unreachable — the page falls back to an empty list rather than breaking.
    return [];
  }
}
