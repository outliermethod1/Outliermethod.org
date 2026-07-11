import "./globals.css";

export const metadata = {
  title: "Outlier Method — The Outdoors Belongs To Everyone.",
  description:
    "Field-tested gear, old-school wisdom, and honest advice to help you get outside without getting screwed. Less money. Less nonsense. More mountains. More life.",
  metadataBase: new URL("https://outliermethod.org"),
  openGraph: {
    title: "Outlier Method",
    description:
      "Field-tested gear, old-school wisdom, and honest advice. The outdoors belongs to everyone.",
    url: "https://outliermethod.org",
    siteName: "Outlier Method",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
