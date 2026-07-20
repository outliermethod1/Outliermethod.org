import "./globals.css";

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
  telephone: "+1-719-270-1280",
  address: {
    "@type": "PostalAddress",
    streetAddress: "PO Box 4129",
    addressLocality: "Gypsum",
    addressRegion: "CO",
    postalCode: "81637",
    addressCountry: "US",
  },
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
      </body>
    </html>
  );
}
