import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

/**
 * A customer on a distributor's shop: find something, understand it, order it,
 * and the order lands in the distributor's portal.
 */

test("on the example shop, a customer can browse by need, read a product and order it", async ({ page }) => {
  await page.goto("/d/kate-cromuel");
  await expect(page.getByRole("heading", { level: 1, name: /Supplements that suit you/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Help me choose/ }).first()).toBeVisible();

  // Filter by need.
  await page.getByRole("button", { name: /^Joints & bones/ }).click();
  await expect(page.getByRole("heading", { name: "For joints & bones" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add ArthroXtra Tablets to basket" })).toBeVisible();

  // Read a product.
  await page.getByRole("link", { name: "ArthroXtra Tablets" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "ArthroXtra Tablets" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Before you take it" })).toBeVisible();
  await page.getByRole("button", { name: "Add to basket" }).first().click();
  await expect(page.getByRole("button", { name: /Basket, 1 item/ })).toBeVisible();

  // Order.
  await page.getByRole("button", { name: /Basket, 1 item/ }).click();
  await page.getByRole("link", { name: "Continue to order" }).click();
  await page.waitForURL(/\/order$/);
  await page.getByLabel("Name").fill("Achieng Otieno");
  await page.getByLabel("Phone number").fill("0722 111 222");
  await page.getByLabel("Where should it go?").fill("Kilimani, Nairobi");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByRole("heading", { name: /Kate has your order/ })).toBeVisible();
  await expect(page.getByText(/example shop, so the order wasn't sent/)).toBeVisible();
  // The example shop shows the WhatsApp message instead of opening a chat.
  await page.getByRole("button", { name: /Tell Kate on WhatsApp/ }).click();
  await expect(page.getByRole("dialog", { name: "WhatsApp message preview" }).getByText(/I've just placed order SO-/)).toBeVisible();
});

test("a real distributor's prices and orders flow between the shop and the portal", async ({ page, browser }, info) => {
  test.setTimeout(180_000);
  await signUp(page, `shop.${info.project.name}.${Date.now()}@example.com`, "Kate Cromuel");

  // Set a price and a note in the portal.
  await page.goto("/portal/shop");
  await page.getByLabel("Price of ArthroXtra Tablets in shillings").fill("5250");
  await page.getByRole("button", { name: "Save prices" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await page.getByLabel("A note to your customers").fill("Ask me anything before you buy.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved. Your shop shows this now.")).toBeVisible();
  const slug = (await page.getByRole("link", { name: "View your shop" }).getAttribute("href"))!;

  // A customer orders from the shop.
  const c = await browser.newContext({ ...info.project.use });
  const cp = await c.newPage();
  await cp.goto(slug);
  await expect(cp.getByText("Ask me anything before you buy.").first()).toBeVisible();
  await cp.goto(`${slug}/p/arthroxtra`);
  await expect(cp.getByText("KES 5,250").first()).toBeVisible();
  await cp.getByRole("button", { name: "Add to basket" }).first().click();
  await cp.goto(`${slug}/order`);
  await cp.getByLabel("Name").fill("Achieng Otieno");
  await cp.getByLabel("Phone number").fill("0722 111 222");
  await cp.getByLabel("Where should it go?").fill("Kilimani, Nairobi");
  await cp.getByRole("button", { name: "Place order · KES 5,250" }).click();
  await expect(cp.getByRole("heading", { name: /Kate has your order/ })).toBeVisible();
  await c.close();

  // It's waiting in the portal.
  await page.goto("/portal");
  await expect(page.getByText("Achieng Otieno ordered from your shop")).toBeVisible();
  await page.goto("/portal/orders");
  await expect(page.getByText("From your shop").first()).toBeVisible();
});
