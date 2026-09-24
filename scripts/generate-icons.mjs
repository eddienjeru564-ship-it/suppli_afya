/**
 * Renders the app icons from the leaf mark. Run after changing the mark:
 *   node scripts/generate-icons.mjs
 * Output goes to public/icons (committed).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const FOREST = "#1e3a2b";
const CREAM = "#f4eee3";
const leaf = (fill, vein) => `
  <path d="M5 27C5 14.3 13.6 5 27 5c0 13.4-9.3 22-22 22Z" fill="${fill}"/>
  ${vein ? `<path d="M7.5 24.5C12 20 17 15 23.5 8.5" stroke="${vein}" stroke-width="1.5" stroke-linecap="round" fill="none"/>` : ""}`;

/** Leaf scaled to `scale` of the canvas, centred. */
const mark = (size, scale, fill, vein) => {
  const s = (size * scale) / 32;
  const o = (size - size * scale) / 2;
  return `<g transform="translate(${o} ${o}) scale(${s})">${leaf(fill, vein)}</g>`;
};

const ICONS = [
  // Shown as-is on desktop and in browsers: rounded square.
  ...[192, 512].map((n) => ({
    file: `icon-${n}.png`,
    size: n,
    svg: `<rect width="${n}" height="${n}" rx="${n * 0.22}" fill="${FOREST}"/>${mark(n, 0.58, CREAM, FOREST)}`,
  })),
  // Android crops maskable icons to its own shape; keep the leaf inside the 80% safe zone.
  ...[192, 512].map((n) => ({
    file: `maskable-${n}.png`,
    size: n,
    svg: `<rect width="${n}" height="${n}" fill="${FOREST}"/>${mark(n, 0.46, CREAM, FOREST)}`,
  })),
  // Notification badge on Android: white on transparent, the system tints it.
  { file: "badge-96.png", size: 96, svg: mark(96, 0.78, "#ffffff", null) },
];

mkdirSync("public/icons", { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const i of ICONS) {
  await page.setViewportSize({ width: i.size, height: i.size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${i.size}" height="${i.size}" viewBox="0 0 ${i.size} ${i.size}">${i.svg}</svg></body></html>`,
  );
  await page.screenshot({ path: `public/icons/${i.file}`, omitBackground: true });
  console.log("wrote", i.file);
}
await browser.close();
