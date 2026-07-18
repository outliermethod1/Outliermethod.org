export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://outliermethod.org/sitemap.xml",
  };
}
