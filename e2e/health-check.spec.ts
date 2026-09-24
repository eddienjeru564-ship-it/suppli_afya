import { expect, test, type Page } from "@playwright/test";

/** Walks the full health check as a customer would, on the standalone page. */

async function choose(page: Page, name: string | RegExp) {
  await page.getByRole("radio", { name, exact: typeof name === "string" }).click();
  await page.waitForTimeout(450);
}
async function tick(page: Page, ...names: (string | RegExp)[]) {
  for (const n of names) await page.getByRole("checkbox", { name: n, exact: typeof n === "string" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(400);
}
async function next(page: Page, label = "Continue") {
  await page.getByRole("button", { name: label }).click();
  await page.waitForTimeout(400);
}

test("a customer can complete the check and get a safe, explained plan", async ({ page }) => {
  await page.goto("/check");
  await expect(page.getByRole("heading", { name: "Let's find what actually suits you." })).toBeVisible();
  await next(page, "Start");
  await next(page, "I understand");

  await page.getByPlaceholder("First name").fill("wanjiru");
  await next(page);
  await expect(page.getByRole("heading", { name: "Nice to meet you, Wanjiru." })).toBeVisible();
  await next(page);

  await choose(page, "Female");
  await page.getByPlaceholder("Age").fill("34");
  await next(page);
  await choose(page, "None of these");
  await choose(page, /Never/);
  await next(page); // goals intro

  await tick(page, /^Energy/, /^Joints & bones/, /^Digestion/);
  await choose(page, "2 of 5");
  await tick(page, "Mid-afternoon");
  await tick(page, /Pain when I walk/);
  await choose(page, "More than a year");
  await choose(page, "No");
  await tick(page, "Constipation", "Bloating or gas");
  await choose(page, "Most weeks");

  await next(page); // daily life intro
  await choose(page, "Mostly home-cooked");
  await choose(page, "One or two");
  await choose(page, "Every day");
  await choose(page, "Less than three glasses");
  await choose(page, "One or two");
  await choose(page, "Five to six");
  await choose(page, "None");
  await choose(page, "No");

  await next(page); // safety intro
  await tick(page, "None of these");
  await tick(page, "Blood pressure medicine");
  await tick(page, /I avoid pork/);
  await choose(page, /focused plan/);

  await expect(page.getByRole("heading", { name: "Wanjiru, here's your plan." })).toBeVisible();
  await expect(page.getByText("Check with your doctor or pharmacist first")).toBeVisible();
  // Pork-derived GluzoJoint-F must be left out, with the reason shown.
  await expect(page.getByText("What we left out, and why")).toBeVisible();
  await expect(page.getByText("One of its ingredients comes from pork, which you avoid.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ArthroXtra Tablets" })).toBeVisible();

  await page.getByRole("button", { name: /See the message Grace gets/ }).click();
  await expect(page.getByText("Hi Grace, I've just done the health check.")).toBeVisible();
  await expect(page.getByText(/Takes blood pressure medicine/)).toBeVisible();
});

test("pregnancy leads to a clinic-first result with no products", async ({ page }) => {
  await page.goto("/check");
  await next(page, "Start");
  await next(page, "I understand");
  await page.getByPlaceholder("First name").fill("Amina");
  await next(page);
  await next(page);
  await choose(page, "Female");
  await page.getByPlaceholder("Age").fill("27");
  await next(page);
  await choose(page, "Pregnant");
  await choose(page, /Not now/);
  await next(page);
  await tick(page, /^Energy/);
  await choose(page, "1 of 5");
  await tick(page, /low most of the day/);
  await next(page);
  for (const a of ["Mostly home-cooked", "Three or more", "Rarely", "Three to six glasses", "Three or four", "Seven to eight", "None", "No"]) {
    await choose(page, a);
  }
  await next(page);
  await tick(page, "None of these");
  await tick(page, "None of these");
  await tick(page, "None of these");
  await choose(page, /one product/);

  await expect(page.getByRole("heading", { name: "Amina, let's start with your clinic." })).toBeVisible();
  await expect(page.getByText(/haven't put together a product plan/)).toBeVisible();
  await expect(page.getByText("Why it's in your plan")).toHaveCount(0);
});

test("the landing page demo updates the distributor panel live", async ({ page }) => {
  await page.goto("/#check");
  const demo = page.locator("#check");
  await demo.getByRole("button", { name: "Start" }).click();
  await page.waitForTimeout(400);
  await demo.getByRole("button", { name: "I understand" }).click();
  await page.waitForTimeout(400);
  await demo.getByPlaceholder("First name").fill("Otieno");
  await expect(demo.getByText("Otieno", { exact: true })).toBeVisible();
});
