import { expect, test } from "@playwright/test";

test("the first screen is readable before any JavaScript arrives", async ({ browser }, info) => {
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, javaScriptEnabled: false, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Most of your next orders are already in your phone.");
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
