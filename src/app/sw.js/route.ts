import { serviceWorker } from "@/pwa/service-worker";

/**
 * Serves the service worker with this deploy's version baked in. A new deploy
 * changes the file, which is how phones learn there's an update.
 */
export const dynamic = "force-static";

export function GET() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
  const body = `/* Suppli Afya ${version} */\n(${serviceWorker.toString()})(${JSON.stringify({ version })});\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
