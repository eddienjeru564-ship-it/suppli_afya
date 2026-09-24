import { devices, expect, test, type BrowserContextOptions } from "@playwright/test";
import { offerInstall, signUp, swReady } from "./helpers";

/**
 * The installed-app experience: installability, offline, install offers per
 * platform, staying signed in, and clearing saved pages on log out.
 * Runs against a production build (the service worker only runs there).
 */

test.describe.configure({ mode: "serial" });

let auth = "";
const iphone: BrowserContextOptions = {
  userAgent: devices["iPhone 14"].userAgent,
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
};

test.beforeAll(async ({ browser }, info) => {
  test.setTimeout(120_000);
  const ctx = await browser.newContext({ ...info.project.use, baseURL: info.project.use.baseURL });
  const page = await ctx.newPage();
  await signUp(page, `pwa.${info.project.name}.${Date.now()}@example.com`);
  auth = info.outputPath("auth.json");
  await ctx.storageState({ path: auth });
  await ctx.close();
});

test("Chrome considers the app installable", async ({ page, request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest).toMatchObject({ id: "/portal", start_url: "/portal", display: "standalone", scope: "/" });
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src);
    expect(res.status(), icon.src).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
  expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);

  const sw = await request.get("/sw.js");
  expect(sw.headers()["content-type"]).toContain("javascript");
  expect(sw.headers()["cache-control"]).toContain("no-cache");

  await page.goto("/login");
  await swReady(page);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  // Playwright's browser contexts count as incognito, where Chrome never installs; nothing else may be wrong.
  expect(installabilityErrors.map((e) => e.errorId).filter((id) => id !== "in-incognito")).toEqual([]);
});

test("pages you've opened still open without signal", async ({ browser }, info) => {
  const ctx = await browser.newContext({ ...info.project.use, storageState: auth });
  const page = await ctx.newPage();
  await page.goto("/portal");
  await swReady(page);
  await page.goto("/portal/customers");
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(async () => Boolean(await (await caches.open("sa-pages-v1")).match("/portal/customers"))))
    .toBe(true);

  await ctx.setOffline(true);
  await page.goto("/portal/customers");
  await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /offline|saved at/ })).toBeVisible();

  // A page that was never saved explains itself instead of failing.
  await page.goto("/portal/orders/new");
  await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible();

  // Back online, the offline page loads the real one by itself.
  await ctx.setOffline(false);
  await expect(page.getByRole("heading", { name: "New order" })).toBeVisible({ timeout: 15_000 });
  await ctx.close();
});

test("Android: the install offer uses the browser's own dialog", async ({ browser }, info) => {
  test.skip(info.project.name !== "mobile", "phones only");
  const ctx = await browser.newContext({ ...info.project.use, storageState: auth });
  const page = await ctx.newPage();
  await page.goto("/portal");
  await offerInstall(page);
  const card = page.getByRole("region", { name: "Add Suppli Afya to your home screen" });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Install" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as Record<string, unknown>).__prompted)).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByText("Suppli Afya is on your home screen")).toBeVisible();
  await expect(card).toBeHidden();
  await ctx.close();
});

test("desktop: install from Settings or the sidebar, and a QR code for the phone", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop", "desktop only");
  const ctx = await browser.newContext({ ...info.project.use, storageState: auth });
  const page = await ctx.newPage();
  await page.goto("/portal/settings");
  await expect(page.getByText("Use Suppli Afya on your phone")).toBeVisible();
  await expect(page.getByRole("img", { name: "QR code that opens your portal on a phone" })).toBeVisible();
  await offerInstall(page);
  await expect(page.getByRole("button", { name: "Install on this computer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Install the app" })).toBeVisible();
  // No install card on the Today page for computers.
  await page.goto("/portal");
  await offerInstall(page);
  await expect(page.getByRole("region", { name: "Add Suppli Afya to your home screen" })).toBeHidden();
  await ctx.close();
});

test("iPhone: clear steps instead of a button that can't work", async ({ browser }, info) => {
  test.skip(info.project.name !== "mobile", "phones only");
  const ctx = await browser.newContext({ ...iphone, baseURL: info.project.use.baseURL, storageState: auth });
  const page = await ctx.newPage();
  await page.goto("/portal");
  const card = page.getByRole("region", { name: "Add Suppli Afya to your home screen" });
  await card.getByRole("button", { name: "Show me how" }).click();
  const sheet = page.getByRole("dialog", { name: "Add Suppli Afya to your home screen" });
  await expect(sheet.getByText("Add to Home Screen")).toBeVisible();
  await expect(sheet.getByText(/log in once/)).toBeVisible();
  await sheet.getByRole("button", { name: "Got it" }).click();
  await expect(sheet).toBeHidden();

  // "Not now" is remembered.
  await card.getByRole("button", { name: "Not now" }).click();
  await expect(card).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)|Welcome/ })).toBeVisible();
  await expect(card).toBeHidden();
  await ctx.close();
});

test("inside Instagram or Facebook: open in the browser first", async ({ browser }, info) => {
  test.skip(info.project.name !== "mobile", "phones only");
  const ctx = await browser.newContext({
    ...iphone,
    userAgent: `${iphone.userAgent} Instagram 300.0.0.0`,
    baseURL: info.project.use.baseURL,
    storageState: auth,
  });
  const page = await ctx.newPage();
  await page.goto("/portal/settings");
  await expect(page.getByText(/Open in Safari/).first()).toBeVisible();
  await ctx.close();
});

test("every portal page fits a small phone without sideways scrolling", async ({ browser }, info) => {
  test.skip(info.project.name !== "mobile", "phones only");
  const ctx = await browser.newContext({ ...iphone, viewport: { width: 360, height: 740 }, baseURL: info.project.use.baseURL, storageState: auth });
  const page = await ctx.newPage();
  for (const path of ["/portal", "/portal/prospects", "/portal/orders", "/portal/orders/new", "/portal/customers", "/portal/customers/new", "/portal/shop", "/portal/settings"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Anything reaching past the page column, except inside rows that scroll sideways on purpose.
    const over = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      const right = main.getBoundingClientRect().right;
      const scrolls = (e: Element | null): boolean => {
        for (let p = e?.parentElement; p && p !== main; p = p.parentElement) {
          if (["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(p).overflowX)) return true;
        }
        return false;
      };
      return [...main.querySelectorAll("*")]
        .filter((e) => e.getBoundingClientRect().right > right + 1 && !scrolls(e))
        .slice(0, 3)
        .map((e) => `${e.tagName}.${String(e.className).slice(0, 60)}`);
    });
    expect(over, path).toEqual([]);
  }
  await ctx.close();
});

test("using the portal keeps you signed in, and logging out clears what's saved on the phone", async ({ browser }, info) => {
  const ctx = await browser.newContext({ ...info.project.use, storageState: auth });
  const page = await ctx.newPage();
  // Pretend the session is about to run out, then use the portal.
  const [cookie] = (await ctx.cookies()).filter((c) => c.name === "sa_session");
  await ctx.addCookies([{ ...cookie, expires: Math.floor(Date.now() / 1000) + 3600 }]);
  await page.goto("/portal");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const [renewed] = (await ctx.cookies()).filter((c) => c.name === "sa_session");
  expect(renewed.expires - Date.now() / 1000).toBeGreaterThan(29 * 86400);

  await swReady(page);
  await page.goto("/portal/orders");
  await expect
    .poll(() => page.evaluate(async () => (await (await caches.open("sa-pages-v1")).keys()).length))
    .toBeGreaterThan(0);
  await page.goto("/portal/settings");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  expect(await page.evaluate(async () => (await (await caches.open("sa-pages-v1")).keys()).length)).toBe(0);
  await ctx.close();
});
