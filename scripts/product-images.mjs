/**
 * Normalises official product photos so the whole catalogue reads as one set.
 * See assets/products/README.md. Usage: node scripts/product-images.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/products";
const OUT = "public/products";
const MANIFEST = "src/config/product-images.json";

// 4:5 canvas. Every product is scaled to the same box and stands on the same floor.
const W = 1200;
const H = 1500;
const BOX_W = 760;
const BOX_H = 1060;
const FLOOR = 1290; // y of the bottom of each product

const sources = JSON.parse(readFileSync(path.join(SRC, "sources.json"), "utf8"));
const catalogue = readFileSync("src/engine/catalogue.ts", "utf8");
const known = new Set([...catalogue.matchAll(/^\s+id: "([a-z0-9-]+)"/gm)].map((m) => m[1]));

mkdirSync(OUT, { recursive: true });
const manifest = {};
const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

for (const file of files) {
  const id = file.replace(/\.[^.]+$/, "");
  if (!known.has(id)) {
    console.warn(`skip ${file}: no product with id "${id}" in the catalogue`);
    continue;
  }
  if (!sources[id]) {
    console.warn(`skip ${file}: add where it came from to ${SRC}/sources.json`);
    continue;
  }
  // Trim the (white or transparent) background so products are measured by the pack itself.
  const trimmed = await sharp(path.join(SRC, file)).rotate().trim({ background: "#ffffff", threshold: 18 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const scale = Math.min(BOX_W / meta.width, BOX_H / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const resized = await sharp(trimmed).resize(w, h, { kernel: "lanczos3" }).toBuffer();

  const canvas = sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
    { input: resized, left: Math.round((W - w) / 2), top: FLOOR - h },
  ]);
  const full = await canvas.webp({ quality: 86, alphaQuality: 90 }).toBuffer();
  writeFileSync(path.join(OUT, `${id}.webp`), full);
  writeFileSync(path.join(OUT, `${id}-600.webp`), await sharp(full).resize(600).webp({ quality: 84 }).toBuffer());
  manifest[id] = { src: `/products/${id}.webp`, small: `/products/${id}-600.webp`, width: W, height: H, source: sources[id] };
  console.log(`ok ${id}`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${Object.keys(manifest).length} product photo(s) ready. Products without one show the illustration.`);
if (!existsSync(OUT)) mkdirSync(OUT);
