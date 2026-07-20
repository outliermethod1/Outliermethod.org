import { getAllPosts } from "./posts";
import { getAllFieldTests } from "./fieldTests";

const BASE_URL = "https://outliermethod.org";

// A compact {title, url, summary} index of real site content, for the guides to reference.
export function getContentIndex() {
  const posts = getAllPosts().map((post) => ({
    title: post.title,
    url: `${BASE_URL}/blog/${post.slug}`,
    summary: post.excerpt || post.description || "",
  }));

  const fieldTests = getAllFieldTests().map((test) => ({
    title: test.title,
    url: `${BASE_URL}/field-tests/${test.slug}`,
    summary: test.description || test.verdict || "",
  }));

  return [...posts, ...fieldTests];
}

export function formatContentIndexForPrompt(items) {
  if (!items || items.length === 0) return "No reference material available yet.";
  return items.map((item) => `- "${item.title}" (${item.url}) — ${item.summary}`).join("\n");
}
