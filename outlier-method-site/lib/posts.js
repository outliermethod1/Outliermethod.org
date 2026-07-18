import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { resolveAuthor } from "./authors";

// Only content/blog is ever read here — content/drafts is never touched.
const BLOG_DIR = path.join(process.cwd(), "content/blog");

function listMarkdownFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));
}

export function getAllPosts() {
  return listMarkdownFiles()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data } = matter(raw);
      return { slug, ...data, author: resolveAuthor(data.author) };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);

  return { slug, ...data, author: resolveAuthor(data.author), html };
}

export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
