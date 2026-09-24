import { expect, test } from "@playwright/test";
import { customerCheck } from "./helpers";

/**
 * The distributor journey end to end, with test payments:
 * pricing → account → a declined payment → retry → set up → portal,
 * then a customer uses the new link and the distributor turns them into a paid order.
 *
 * Needs the server started with PAYMENTS_ALLOW_TEST=true (playwright.config.ts does this).
 */

test.describe.configure({ mode: "serial" });


test("a distributor can pay, set up and run their first order", async ({ page, browser }, info) => {
  test.setTimeout(180_000);
  const email = `jane.${info.project.name}.${Date.now()}@example.com`;
  const password = "supersecret1";

  // Pricing on the homepage → the chosen plan carries into checkout.
  await page.goto("/#pricing");
  await page.getByRole("link", { name: "Choose Growth" }).click();
  await page.waitForURL(/\/start\?plan=growth/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.waitForURL(/\/start\/pay/);

  // A declined payment keeps the account and offers a retry.
  await page.getByLabel("M-Pesa number").fill("0712 345 678");
  await page.getByRole("button", { name: /Pay KES 2,900/ }).click();
  await page.getByRole("button", { name: "Decline it" }).click();
  await expect(page.getByText("The payment didn't go through").first()).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByRole("button", { name: /Pay KES 2,900/ }).click();
  await page.getByRole("button", { name: "Approve payment" }).click();
  await page.waitForURL(/\/start\/welcome/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Payment confirmed." })).toBeVisible();

  // Onboarding.
  await page.getByRole("link", { name: "Set up my workspace" }).click();
  await page.waitForURL(/\/start\/setup/);
  await page.getByLabel("Your name").fill("Jane Wanjiku");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Business or shop name").fill("Afya Bora Wellness");
  await page.getByLabel("Where are you based?").fill("Thika");
  await page.getByRole("radio", { name: /Independent distributor/ }).click();
  await page.getByLabel("Your WhatsApp number").fill("0712345678");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox", { name: "WhatsApp" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox", { name: "Get more repeat purchases" }).click();
  await page.getByRole("button", { name: "Finish setting up" }).click();
  await expect(page.getByRole("heading", { name: "You're all set, Jane." })).toBeVisible();
  const link = (await page.getByText(/\/d\/jane-wanjiku[a-z0-9-]*/).first().textContent())!;
  const slug = link.match(/\/d\/(jane-wanjiku[a-z0-9-]*)/)![1];

  await page.getByRole("link", { name: "Enter my distributor portal" }).click();
  await page.waitForURL(/\/portal$/);
  await expect(page.getByText("Welcome, Jane.").first()).toBeVisible();

  // Setup is never shown again once it's done.
  await page.goto("/start/setup");
  await page.waitForURL(/\/portal$/);

  // A customer does the check through the new link and sends it.
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const cp = await c.newPage();
  await cp.route("https://wa.me/**", (r) => r.fulfill({ status: 200, body: "whatsapp" }));
  await cp.goto(`/d/${slug}/check`);
  await customerCheck(cp);
  await cp.getByPlaceholder("07XX XXX XXX").fill("0722 111 222");
  await cp.getByRole("button", { name: "Send on WhatsApp" }).click();
  await cp.waitForURL(/wa\.me/);
  await c.close();

  // The prospect arrives, becomes an order and gets paid.
  await page.goto("/portal/prospects");
  await page.getByRole("link", { name: /Achieng/ }).first().click();
  await page.waitForURL(/prospects\//);
  await page.getByRole("link", { name: "Create an order" }).click();
  await page.waitForURL(/orders\/new/);
  await expect(page.getByRole("heading", { name: "New order" })).toBeVisible();
  const prices = page.getByPlaceholder("0");
  for (let i = 0; i < (await prices.count()); i++) await prices.nth(i).fill(String(3500 + i * 1000));
  await page.getByRole("button", { name: /Save order/ }).click();
  await page.waitForURL(/orders\/[0-9a-f-]{36}$/);
  await page.getByPlaceholder(/M-Pesa code/).fill("SJK4H7Q2XP");
  await page.getByRole("button", { name: "Mark as paid" }).click();
  await expect(page.getByText("SJK4H7Q2XP").first()).toBeVisible();

  await page.goto("/portal/customers");
  await expect(page.getByRole("link", { name: /Achieng/ }).first()).toBeVisible();

  // Log out, log back in: straight to the portal, no onboarding.
  await page.goto("/portal/settings");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/portal$/);
});

test("someone without an account is sent to log in, not into the portal", async ({ page }) => {
  await page.goto("/portal");
  await page.waitForURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
