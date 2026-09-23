import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Suppli Afya — for BF Suma distributors",
    template: "%s · Suppli Afya",
  },
  description: site.description,
  openGraph: {
    title: "Suppli Afya — Sell more. Follow up less.",
    description: site.description,
    siteName: site.name,
    locale: "en_KE",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f4eee3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" className={`${newsreader.variable} ${hanken.variable} antialiased`}>
      <body className="grain min-h-dvh">{children}</body>
    </html>
  );
}
