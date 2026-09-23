import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for phones, so a saved link looks like the brand. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e3a2b" }}>
        <svg width="112" height="112" viewBox="0 0 32 32">
          <path d="M5 27C5 14.3 13.6 5 27 5c0 13.4-9.3 22-22 22Z" fill="#f4eee3" />
          <path d="M7.5 24.5C12 20 17 15 23.5 8.5" stroke="#1e3a2b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
