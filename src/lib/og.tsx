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

/** Link preview card. These show up in WhatsApp chats, so they need to read at thumbnail size. */
export async function brandCard({
  eyebrow,
  title,
  emphasis,
  footer,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
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
          <div style={{ fontSize: 26, color: "#98552f", marginBottom: 18 }}>{eyebrow}</div>
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
