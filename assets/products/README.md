# Product photos

Official product photos go here, one per product, named by catalogue id
(`src/engine/catalogue.ts`), e.g. `arthroxtra.png`, `veggie-veggie.jpg`.

Rules:

- **Official images only**, from BF Suma or supplied by BF Suma Kenya to distributors. No generated,
  redrawn or "similar looking" packaging, ever. If the exact pack isn't available, leave the product
  without a photo: the shop shows a clean illustration instead.
- **Check the pack matches the catalogue entry**: name, variant and size (e.g. the 60-capsule pack, not
  the 30).
- **Record where each image came from** in `sources.json` (`{ "arthroxtra": "https://…" }`). The script
  skips any image without a source.
- A plain white or transparent background works best. Largest size you can get (1000px+ tall).

Then run:

```bash
node scripts/product-images.mjs
```

It trims each photo, stands every product on the same baseline at the same height on a 4:5 canvas
(so the catalogue looks like one set), and writes web-ready files to `public/products/` plus the list
the site reads (`src/config/product-images.json`).
