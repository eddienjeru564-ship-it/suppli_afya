/**
 * Renders every brand file from the traced artwork in src/components/brand/artwork.ts.
 * Run after changing the artwork:
 *   node --experimental-strip-types --no-warnings scripts/generate-icons.mjs
 * Output (committed): public/icons (app icons), public/brand (logo files, email logo), src/app/icon.svg (favicon).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const art = await import("../src/components/brand/artwork.ts");
const { MARK, WORDMARK, POWERED_BY, BRAND, markSvg, markDocument, logoDocument } = art;

const BG = "#fbf8f2";
const ratio = MARK.width / MARK.height;

/** The mark `h` tall, centred in a `size` square. */
const centred = (size, h, tone, id, mono) => {
  const w = h * ratio;
  return `<svg x="${(size - w) / 2}" y="${(size - h) / 2}" width="${w}" height="${h}" viewBox="${MARK.viewBox}">${markSvg(tone, id, mono)}</svg>`;
};

const ICONS = [
  // Shown as-is on desktop and in browsers: rounded square.
  ...[192, 512].map((n) => ({
    file: `icons/icon-${n}.png`,
    w: n,
    h: n,
    svg: `<rect width="${n}" height="${n}" rx="${n * 0.22}" fill="${BG}"/>${centred(n, n * 0.66, "color", "i")}`,
  })),
  // Android crops maskable icons to its own shape; keep the mark inside the 80% safe circle.
  ...[192, 512].map((n) => ({
    file: `icons/maskable-${n}.png`,
    w: n,
    h: n,
    svg: `<rect width="${n}" height="${n}" fill="${BG}"/>${centred(n, n * 0.54, "color", "m")}`,
  })),
  // Notification badge on Android: white on transparent, the system tints it.
  { file: "icons/badge-96.png", w: 96, h: 96, svg: centred(96, 88, "mono", "b", "#ffffff") },
];

// Email logo: PNG because mail apps don't show SVG. Rendered at 3x for sharp phone screens.
const email = logoDocument("color");
const EMAIL_H = 40 * 3;
const emailW = Math.round((email.width / email.height) * EMAIL_H);
ICONS.push({
  file: "brand/logo-email.png",
  w: emailW,
  h: EMAIL_H,
  svg: `<svg width="${emailW}" height="${EMAIL_H}" viewBox="0 0 ${email.width} ${email.height}">${email.svg}</svg>`,
});

mkdirSync("public/icons", { recursive: true });
mkdirSync("public/brand", { recursive: true });

// Vector files for press, partners and anyone who needs the logo.
const poweredBy = (() => {
  const markH = 247;
  const markW = ratio * markH;
  const x = markW + 44;
  const width = Math.ceil(x + 12 + WORDMARK.width);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${markH}" width="${width}" height="${markH}">` +
    `<svg width="${markW}" height="${markH}" viewBox="${MARK.viewBox}">${markSvg("color", "p")}</svg>` +
    `<svg x="${x}" y="39" width="${POWERED_BY.width}" height="${POWERED_BY.height}" viewBox="${POWERED_BY.viewBox}"><path fill-rule="evenodd" fill="${BRAND.ink}" d="${POWERED_BY.d}"/></svg>` +
    `<svg x="${x + 12}" y="108" width="${WORDMARK.width}" height="${WORDMARK.height}" viewBox="${WORDMARK.viewBox}"><path fill-rule="evenodd" fill="${BRAND.ink}" d="${WORDMARK.d}"/></svg></svg>`
  );
})();
const files = {
  "public/brand/mark.svg": markDocument("color"),
  "public/brand/mark-light.svg": markDocument("light"),
  "public/brand/logo.svg": logoDocument("color").svg,
  "public/brand/logo-light.svg": logoDocument("light").svg,
  "public/brand/powered-by.svg": poweredBy,
};

// Favicon: the colour mark, switched to the light mark when the browser chrome is dark.
const fav = (tone, id) => `<svg width="64" height="64" viewBox="0 0 64 64">${centred(64, 62, tone, id)}</svg>`;
files["src/app/icon.svg"] =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.d{display:none}@media (prefers-color-scheme:dark){.l{display:none}.d{display:inline}}</style>` +
  `<g class="l">${fav("color", "f")}</g><g class="d">${fav("light", "g")}</g></svg>`;

for (const [path, svg] of Object.entries(files)) {
  writeFileSync(path, svg);
  console.log("wrote", path);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const i of ICONS) {
  await page.setViewportSize({ width: i.w, height: i.h });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${i.w}" height="${i.h}" viewBox="0 0 ${i.w} ${i.h}">${i.svg}</svg></body></html>`,
  );
  await page.screenshot({ path: `public/${i.file}`, omitBackground: true });
  console.log("wrote", i.file);
}
await browser.close();
