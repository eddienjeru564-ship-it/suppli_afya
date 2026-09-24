import { devices, expect, test } from "@playwright/test";
import { customerCheck, signUp } from "./helpers";

/**
 * Regenerates the app screenshots in public/screenshots, which Android shows
 * in its install dialog. Not part of the normal run:
 *   npm run build && SCREENSHOTS=1 npx playwright test e2e/screenshots.spec.ts --project=mobile
 */
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to regenerate");

test("app screenshots", async ({ browser }, info) => {
  test.setTimeout(240_000);
  const base = { baseURL: info.project.use.baseURL };
  const ctx = await browser.newContext({ ...devices["Pixel 7"], ...base, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  // The install card shouldn't appear in pictures shown inside the install dialog.
  await ctx.addInitScript(() => localStorage.setItem("sa-install-dismissed-at", String(Date.now())));
  const page = await ctx.newPage();
  await signUp(page, `screens.${Date.now()}@example.com`, "Grace Wambui");
  const slug = new URL(page.url()).origin;

  // A prospect from the health check link.
  const settings = await page.goto("/portal/settings");
  expect(settings?.ok()).toBe(true);
  const link = (await page.getByText(/\/d\/grace-wambui[a-z0-9-]*/).first().textContent())!;
  const c = await browser.newContext({ ...base, viewport: { width: 390, height: 844 } });
  const cp = await c.newPage();
  await cp.route("https://wa.me/**", (r) => r.fulfill({ status: 200, body: "whatsapp" }));
  await cp.goto(`${slug}/d/${link.match(/\/d\/([a-z0-9-]+)/)![1]}/check`);
  await customerCheck(cp);
  await cp.getByPlaceholder("07XX XXX XXX").fill("0722 111 222");
  await cp.getByRole("button", { name: "Send on WhatsApp" }).click();
  await cp.waitForURL(/wa\.me/);
  await c.close();

  // Customers, and an order still waiting for payment.
  for (const [name, phone] of [["Otieno Kamau", "0722000111"], ["Mama Njeri", "0733000222"], ["Kiprono Rotich", "0744000333"]]) {
    await page.goto("/portal/customers/new");
    await page.getByLabel(/Name/).first().fill(name);
    await page.getByLabel(/Phone/).first().fill(phone);
    await page.getByRole("button", { name: /Add customer/ }).click();
    await page.waitForURL(/customers\/[0-9a-f-]{36}/);
  }
  await page.getByRole("link", { name: "Record their first order" }).click();
  await expect(page.getByRole("heading", { name: "New order" })).toBeVisible();
  await page.getByLabel("Product").first().selectOption({ label: "Veggie Veggie" });
  await page.getByPlaceholder("0").first().fill("4200");
  await page.getByRole("button", { name: /Save order/ }).click();
  await page.waitForURL(/orders\/[0-9a-f-]{36}$/);

  const shots = [
    { path: "/portal", file: "today" },
    { path: "/portal/customers", file: "customers" },
  ];
  for (const s of shots) {
    await page.goto(s.path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `public/screenshots/${s.file}-narrow.png` });
  }

  const wide = await browser.newContext({ ...base, storageState: await ctx.storageState(), viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
  const w = await wide.newPage();
  await w.goto("/portal");
  await expect(w.getByRole("heading", { level: 1 })).toBeVisible();
  await w.waitForTimeout(800);
  await w.screenshot({ path: "public/screenshots/today-wide.png" });
  await wide.close();
  await ctx.close();
});
