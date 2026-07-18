import { getAllPosts } from "../lib/posts";

const BASE_URL = "https://outliermethod.org";

export default function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/disclosure`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/gear`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/community`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/woodworking`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const postRoutes = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
