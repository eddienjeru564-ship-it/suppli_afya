import { expect, test } from "@playwright/test";

test("the first screen is readable before any JavaScript arrives", async ({ browser }, info) => {
  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, javaScriptEnabled: false, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Your own page for turning curiosity into customers.");
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

test("a distributor can see the example page with their own name on it", async ({ page }) => {
  await page.goto("/#page");
  const section = page.locator("#page");
  await section.getByLabel("See it with your name").fill("Grace Wambui");
  await expect(section.getByText("suppliafya.co.ke/d/grace-wambui", { exact: false }).first()).toBeVisible();
  await expect(section.getByText("This is what Grace's customers would see.")).toBeVisible();
  await section.getByRole("button", { name: "Back to Kate" }).click();
  await expect(section.getByLabel("See it with your name")).toHaveValue("");
});

test("the tour steps through one customer's journey, and stops playing when you choose a step", async ({ page }, info) => {
  await page.goto("/#how");
  const tour = page.locator("#how");
  if (info.project.name === "mobile") {
    await tour.getByRole("button", { name: "Step 4: Connect" }).click();
    await expect(tour.getByRole("heading", { name: "She sends her plan to Kate" })).toBeVisible();
    // The step is about Kate's side; the switch shows Sarah's instead.
    await expect(tour.getByRole("button", { name: "Kate's phone" })).toHaveAttribute("aria-pressed", "true");
    await tour.getByRole("button", { name: "Sarah's phone" }).click();
    await expect(tour.getByRole("button", { name: "Sarah's phone" })).toHaveAttribute("aria-pressed", "true");
  } else {
    await tour.getByRole("button", { name: /She sends her plan to Kate/ }).click();
    await expect(tour.getByRole("button", { name: /She sends her plan to Kate/ })).toHaveAttribute("aria-current", "step");
  }
  await expect(tour.getByRole("button", { name: "Play the steps" })).toBeVisible();
  await tour.getByRole("button", { name: "Next step" }).click();
  await expect(tour.locator('[aria-current="step"]').filter({ visible: true })).toContainText(/5|Kate replies/);
});

test("the workspace preview shows each person's ready message", async ({ page }) => {
  await page.goto("/#workspace");
  const ws = page.locator("#workspace");
  await expect(ws.getByText(/Habari Sarah! It's about time for your next/)).toBeVisible();
  await ws.getByRole("button", { name: /Achieng/ }).click();
  await expect(ws.getByText(/just a quick reminder about your order of KES 7,800/)).toBeVisible();
});
