import { ImageResponse } from "next/og";
import { SPLASH_SIZES } from "@/config/pwa";
import { MARK, markDocument, svgDataUri } from "@/components/brand/artwork";

const MARK_SRC = svgDataUri(markDocument("color"));

/**
 * iOS launch screens. iPhones show a blank white screen while an installed
 * web app starts unless there's an image for their exact screen size, so we
 * render one per device: the brand mark on the portal's cream.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return SPLASH_SIZES.map((s) => ({ size: `${s.w}x${s.h}` }));
}

export async function GET(_req: Request, ctx: RouteContext<"/splash/[size]">) {
  const { size } = await ctx.params;
  const known = SPLASH_SIZES.find((s) => `${s.w}x${s.h}` === size);
  if (!known) return new Response("Not found", { status: 404 });
  const { w, h } = known;
  const icon = Math.round(w * 0.3);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4eee3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={MARK_SRC} height={icon} width={Math.round((icon * MARK.width) / MARK.height)} />
      </div>
    ),
    { width: w, height: h, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
