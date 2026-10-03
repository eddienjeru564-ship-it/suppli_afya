import { expect, test } from "@playwright/test";

test("the first screen is readable before any JavaScript arrives", async ({ browser }, info) => {
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, javaScriptEnabled: false, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Helping BF Suma Distributors in Kenya Turn Curiosity Into Customers");
  // Every word is visible in the HTML itself, not waiting on a script to fade it in.
  const hidden = await h1.locator("span span").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
  expect(hidden).toBe(0);
  // And the words have spaces between them on screen, not only in the text.
  const [a, b] = await h1.locator(":scope > span").evaluateAll((els) => els.slice(0, 2).map((e) => {
    const r = e.getBoundingClientRect();
    return { left: r.left, right: r.right };
  }));
  expect(b.left - a.right).toBeGreaterThan(4);
  await ctx.close();
});

test("public pages fit a small phone without sideways scrolling", async ({ browser }, info) => {
  test.skip(info.project.name !== "mobile", "phones only");
  // A plain 360px window: phone emulation zooms out to fit a page that's too wide, which hides the problem.
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, viewport: { width: 360, height: 740 } });
  const page = await ctx.newPage();
  for (const path of ["/", "/check", "/start?plan=growth", "/login", "/privacy"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(360);
  }
  await ctx.close();
});

test("pages hydrate cleanly for people who asked for reduced motion", async ({ browser }, info) => {
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const path of ["/", "/check", "/start?plan=growth", "/login"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
  await ctx.close();
});

test("the workspace preview opens each person's ready message", async ({ page }) => {
  await page.goto("/#after");
  const ws = page.locator("#after");
  await expect(ws.getByText(/Habari Sarah! It's about time for your next/)).toBeVisible();
  await ws.getByRole("button", { name: /Achieng/ }).click();
  await expect(ws.getByText(/just a quick reminder about your order of KES 7,800/)).toBeVisible();
});

test("the offer leads straight to checkout", async ({ page }) => {
  await page.goto("/#pricing");
  await page.locator("#pricing").getByRole("link", { name: "Claim your page now" }).click();
  await expect(page).toHaveURL(/\/start\?plan=starter/);
});
