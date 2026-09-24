import type { Page } from "@playwright/test";

/** Signs up, pays with a test payment and finishes set up. Leaves the page on /portal. */
export async function signUp(page: Page, email: string, name = "Jane Wanjiku") {
  await page.goto("/start?plan=growth");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("supersecret1");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.waitForURL(/\/start\/pay/);
  await page.getByLabel("M-Pesa number").fill("0712 345 678");
  await page.getByRole("button", { name: /Pay KES/ }).click();
  await page.getByRole("button", { name: "Approve payment" }).click();
  await page.waitForURL(/\/start\/welcome/, { timeout: 20_000 });
  await page.getByRole("link", { name: "Set up my workspace" }).click();
  await page.waitForURL(/\/start\/setup/);
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Business or shop name").fill("Afya Bora Wellness");
  await page.getByLabel("Where are you based?").fill("Thika");
  await page.getByRole("radio", { name: /Independent distributor/ }).click();
  await page.getByLabel("Your WhatsApp number").fill("0712345678");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox", { name: "WhatsApp" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("checkbox", { name: "Follow up with customers" }).click();
  await page.getByRole("button", { name: "Finish setting up" }).click();
  await page.getByRole("link", { name: "Enter my distributor portal" }).click();
  await page.waitForURL(/\/portal$/);
}

/** Waits until the service worker controls the page. */
export async function swReady(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 20_000 });
}

/** Pretends the browser offered installation, the way Chrome on Android does. */
export async function offerInstall(page: Page, outcome: "accepted" | "dismissed" = "accepted") {
  await page.evaluate((outcome) => {
    const e = new Event("beforeinstallprompt", { cancelable: true }) as Event & Record<string, unknown>;
    e.prompt = async () => {
      (window as unknown as Record<string, unknown>).__prompted = true;
    };
    e.userChoice = Promise.resolve({ outcome });
    window.dispatchEvent(e);
  }, outcome);
}

/** Walks the customer health check with a typical set of answers (joints and energy, no warnings). */
export async function customerCheck(page: Page) {
  const pick = async (name: string | RegExp) => {
    await page.getByRole("radio", { name, exact: typeof name === "string" }).click();
    await page.waitForTimeout(450);
  };
  const next = async (label = "Continue") => {
    await page.getByRole("button", { name: label }).click();
    await page.waitForTimeout(420);
  };
  const tick = async (...names: (string | RegExp)[]) => {
    for (const n of names) await page.getByRole("checkbox", { name: n, exact: typeof n === "string" }).click();
    await next();
  };
  await next("Start");
  await next("I understand");
  await page.getByPlaceholder("First name").fill("Achieng");
  await next();
  await next();
  await pick("Female");
  await page.getByPlaceholder("Age").fill("41");
  await next();
  await pick("None of these");
  await pick(/Never/);
  await next();
  await tick(/^Joints/, /^Energy/);
  await tick(/Pain when I walk/);
  await pick("More than a year");
  await pick("No");
  await pick("2 of 5");
  await tick("Mid-afternoon");
  await next();
  for (const a of ["Mostly home-cooked", "One or two", "Every day", "Less than three glasses", "One or two", "Five to six", "None", "No"])
    await pick(a);
  await next();
  await tick("None of these");
  await tick("None of these");
  await tick("None of these");
  await pick(/focused plan/);
}
