import { getAllPosts } from "../lib/posts";
import { getStateSlugs } from "../lib/states";
import { getAllFieldTests } from "../lib/fieldTests";

const BASE_URL = "https://outliermethod.org";

export default function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/field-tests`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/states`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/why-trust-us`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/disclosure`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/originals`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/community`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/woodworking`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const stateRoutes = getStateSlugs().map((slug) => ({
    url: `${BASE_URL}/states/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const fieldTestRoutes = getAllFieldTests().map((test) => ({
    url: `${BASE_URL}/field-tests/${test.slug}`,
    lastModified: test.date ? new Date(test.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...stateRoutes, ...postRoutes, ...fieldTestRoutes];
}
