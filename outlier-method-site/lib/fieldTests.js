import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { resolveAuthor } from "./authors";

const FIELD_TESTS_DIR = path.join(process.cwd(), "content/field-tests");

function listMarkdownFiles() {
  if (!fs.existsSync(FIELD_TESTS_DIR)) return [];
  return fs.readdirSync(FIELD_TESTS_DIR).filter((file) => file.endsWith(".md"));
}

export function getAllFieldTests() {
  return listMarkdownFiles()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(FIELD_TESTS_DIR, file), "utf8");
      const { data } = matter(raw);
      return { slug, ...data, author: resolveAuthor(data.author) };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getFieldTestBySlug(slug) {
  const filePath = path.join(FIELD_TESTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);

  return { slug, ...data, author: resolveAuthor(data.author), html };
}

export function getOutlierScoreAverage(scores) {
  const values = Object.values(scores);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
