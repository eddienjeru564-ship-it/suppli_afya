/** iPhone screens (portrait) we render launch images for: CSS size × pixel ratio. */
export const SPLASH_SIZES = [
  { cssW: 440, cssH: 956, dpr: 3 }, // 16 Pro Max
  { cssW: 402, cssH: 874, dpr: 3 }, // 16 Pro
  { cssW: 430, cssH: 932, dpr: 3 }, // 14 Pro Max – 16 Plus
  { cssW: 393, cssH: 852, dpr: 3 }, // 14 Pro – 16
  { cssW: 428, cssH: 926, dpr: 3 }, // 12 Pro Max – 14 Plus
  { cssW: 390, cssH: 844, dpr: 3 }, // 12 – 14
  { cssW: 375, cssH: 812, dpr: 3 }, // X – 13 mini
  { cssW: 414, cssH: 896, dpr: 3 }, // XS Max, 11 Pro Max
  { cssW: 414, cssH: 896, dpr: 2 }, // XR, 11
  { cssW: 414, cssH: 736, dpr: 3 }, // 8 Plus
  { cssW: 375, cssH: 667, dpr: 2 }, // SE, 8
].map((s) => ({ ...s, w: s.cssW * s.dpr, h: s.cssH * s.dpr }));

export const splashStartupImages = SPLASH_SIZES.map((s) => ({
  url: `/splash/${s.w}x${s.h}`,
  media: `(device-width: ${s.cssW}px) and (device-height: ${s.cssH}px) and (-webkit-device-pixel-ratio: ${s.dpr}) and (orientation: portrait)`,
}));
