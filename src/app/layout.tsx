import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { splashStartupImages } from "@/config/pwa";
import { site } from "@/config/site";
import { PwaProvider } from "@/components/pwa/PwaProvider";
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
  applicationName: "Suppli Afya",
  // Installed on an iPhone: full screen, its own name under the icon, and a launch screen.
  appleWebApp: {
    capable: true,
    title: "Suppli Afya",
    statusBarStyle: "default",
    startupImage: splashStartupImages,
  },
  // Phone numbers are shown and linked on purpose; stop iOS turning every number into a link.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4eee3",
  colorScheme: "light",
  // Draw under notches and home indicators; layouts pad with env(safe-area-inset-*).
  viewportFit: "cover",
  // When the keyboard opens, shrink the page rather than covering buttons.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" className={`${newsreader.variable} ${hanken.variable} antialiased`}>
      <body className="grain min-h-dvh">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
