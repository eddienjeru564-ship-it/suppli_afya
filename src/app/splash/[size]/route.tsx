import { ImageResponse } from "next/og";
import { SPLASH_SIZES } from "@/config/pwa";

/**
 * iOS launch screens. iPhones show a blank white screen while an installed
 * web app starts unless there's an image for their exact screen size, so we
 * render one per device: the app icon on the portal's cream.
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
  const icon = Math.round(w * 0.22);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4eee3" }}>
        <div
          style={{
            width: icon,
            height: icon,
            borderRadius: icon * 0.23,
            background: "#1e3a2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={icon * 0.58} height={icon * 0.58} viewBox="0 0 32 32">
            <path d="M5 27C5 14.3 13.6 5 27 5c0 13.4-9.3 22-22 22Z" fill="#f4eee3" />
            <path d="M7.5 24.5C12 20 17 15 23.5 8.5" stroke="#1e3a2b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    ),
    { width: w, height: h, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
