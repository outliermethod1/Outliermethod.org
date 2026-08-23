import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", weight: ["500", "600", "700"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AD Chief of Staff | Outlier Method",
  description:
    "Meet Coach Eli Govern — thirty years in the chair, and every bylaw in your state, on call. Eligibility guidance grounded in your state association's bylaws, plus the full operational workload of running an athletic department.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-bone text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
