import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [regular, italic, sans] = await Promise.all([
    readFile(join(dir, "Newsreader-Regular.woff")),
    readFile(join(dir, "Newsreader-Italic.woff")),
    readFile(join(dir, "HankenGrotesk-SemiBold.woff")),
  ]);
  return [
    { name: "Newsreader", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Newsreader", data: italic, style: "italic" as const, weight: 400 as const },
    { name: "Hanken", data: sans, style: "normal" as const, weight: 600 as const },
  ];
}

/** The hero's underline (src/components/site/Hero.tsx): a brush stroke that ends in a pen-lift flick. */
const STROKE = "M4 16C90 11.2 220 8.7 352 8.9C372 8.9 386 6.2 396 2.4C397.4 1.8 398.7 3.3 398 4.4C390 11.3 376 15 352 15.6C220 15.8 96 18.1 7 20.7C4 21.6 1.6 16.9 4 16Z";

/**
 * Link preview card. These show up in WhatsApp chats, so they need to read at thumbnail size.
 * Give either a `title` (with an optional italic `emphasis`) or a `headline` set line by line,
 * with one `marked` phrase underlined in clay, the way the homepage hero sets it.
 */
export async function brandCard({
  eyebrow,
  title,
  emphasis,
  headline,
  marked,
  footer,
}: {
  eyebrow?: string;
  title?: string;
  emphasis?: string;
  headline?: string[];
  marked?: string;
  footer: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4eee3",
          padding: "64px 72px",
          fontFamily: "Hanken",
          color: "#16241c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="44" height="44" viewBox="0 0 32 32">
            <path d="M5 27C5 14.3 13.6 5 27 5c0 13.4-9.3 22-22 22Z" fill="#1e3a2b" />
            <path d="M7.5 24.5C12 20 17 15 23.5 8.5" stroke="#f4eee3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 38, color: "#1e3a2b" }}>
            Suppli&nbsp;<span style={{ fontStyle: "italic" }}>Afya</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && <div style={{ fontSize: 26, color: "#8a4a27", marginBottom: 18 }}>{eyebrow}</div>}
          {headline ? (
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Newsreader", fontSize: 78, lineHeight: 1.06, letterSpacing: -1.5 }}>
              {headline.map((line) => {
                const at = marked ? line.indexOf(marked) : -1;
                // A space after every word, except the last one under the stroke, so the stroke ends with it.
                const words = (t: string, last = true) =>
                  t
                    .split(" ")
                    .filter(Boolean)
                    .map((w, i, all) => (
                      <span key={i} style={{ marginRight: last || i < all.length - 1 ? 20 : 0 }}>
                        {w}
                      </span>
                    ));
                if (!marked || at < 0) return <div key={line} style={{ display: "flex" }}>{words(line)}</div>;
                return (
                  <div key={line} style={{ display: "flex" }}>
                    {words(line.slice(0, at))}
                    <div style={{ display: "flex", position: "relative", marginRight: 20 }}>
                      {words(marked, false)}
                      <svg
                        viewBox="0 0 400 24"
                        preserveAspectRatio="none"
                        width="106%"
                        height="33"
                        style={{ position: "absolute", left: "-3%", top: 54 }}
                      >
                        <path d={STROKE} fill="#8a4a27" />
                      </svg>
                    </div>
                    {words(line.slice(at + marked.length))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontFamily: "Newsreader",
                fontSize: 84,
                lineHeight: 1.04,
                letterSpacing: -2,
                maxWidth: 1000,
              }}
            >
              <span style={{ marginRight: 20 }}>{title}</span>
              {emphasis && <span style={{ fontStyle: "italic", color: "#1e3a2b" }}>{emphasis}</span>}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#46534b" }}>
          <span>{footer}</span>
          <span style={{ color: "#1e3a2b" }}>suppliafya.co.ke</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}
