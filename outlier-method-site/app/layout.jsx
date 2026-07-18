import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Outlier Method — The Outdoors Belongs To Everyone.",
  description:
    "Field-tested gear, old-school wisdom, and honest advice to help you get outside without getting screwed. Less money. Less nonsense. More mountains. More life.",
  keywords: [
    "upland hunting",
    "elk hunting",
    "public land",
    "field-tested gear",
    "hunting gear reviews",
    "Colorado hunting",
    "tracking big game",
    "outdoor gear on a budget",
  ],
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

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Outlier Method",
  url: "https://outliermethod.org",
  founder: {
    "@type": "Person",
    name: "Ryan Lynch",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        {children}
        <Script
          src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=78addbf506a99ba644690e13bb7f4eb163db2bf7"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
