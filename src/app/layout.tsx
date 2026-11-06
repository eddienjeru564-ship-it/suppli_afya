import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { preload } from "react-dom";
import { splashStartupImages } from "@/config/pwa";
import { site } from "@/config/site";
import { KEYWORDS } from "@/config/seo";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Suppli Afya · Shop and customer app for BF Suma distributors in Kenya",
    template: "%s · Suppli Afya",
  },
  description: site.description,
  keywords: KEYWORDS,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "business",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    title: "Suppli Afya: turn curiosity into customers",
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

/**
 * Newsreader, the display face, is served from /fonts (see globals.css). Only the upright cut is
 * preloaded: it sets the first screen's headline. The italic is only used further down, so it loads
 * when a page first needs it instead of competing with the first screen on a slow connection.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  preload("/fonts/newsreader-normal-v1.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en-KE" className={`${hanken.variable} antialiased`}>
      <body className="grain min-h-dvh">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
