import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Suppli Afya",
    short_name: "Suppli Afya",
    description: "Sell more. Follow up less. For BF Suma distributors in Kenya.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4eee3",
    theme_color: "#1e3a2b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
