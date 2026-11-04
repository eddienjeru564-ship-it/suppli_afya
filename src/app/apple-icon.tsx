import { ImageResponse } from "next/og";
import { MARK, markDocument, svgDataUri } from "@/components/brand/artwork";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_H = 120;

/** Home-screen icon for phones, so a saved link looks like the brand. iOS rounds the corners itself. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf8f2" }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={svgDataUri(markDocument("color"))} height={MARK_H} width={Math.round((MARK_H * MARK.width) / MARK.height)} />
      </div>
    ),
    size,
  );
}
