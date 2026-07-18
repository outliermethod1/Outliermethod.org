import "./globals.css";

export const metadata = {
  title: "Outlier Method – The Outdoors Belongs To Everyone.",
  description: "Field-tested gear, old-school wisdom, and honest advice to help you get outside without getting screwed.",
  metadataBase: new URL("https://outliermethod.org"),
  openGraph: {
    title: "Outlier Method",
    description: "Field-tested gear, old-school wisdom, and honest advice. The outdoors belongs to everyone.",
    url: "https://outliermethod.org",
    siteName: "Outlier Method",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script type="text/javascript" src="http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=78addbf506a99ba644690e13bb7f4eb163db2bf7" />
      </head>
      <body>{children}</body>
    </html>
  );
}
