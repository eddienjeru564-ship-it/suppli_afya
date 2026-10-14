import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // The embedded database takes a while to start when every test file opens one at once.
  test: { include: ["src/**/*.test.ts"], environment: "node", hookTimeout: 60_000 },
});
