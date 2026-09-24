/**
 * Checks the PayHero setup with a real KES 1 M-Pesa prompt.
 *
 *   npm run payhero:check -- 0712345678   (reads .env.local)
 *
 * It sends the prompt to that phone, waits for the PIN, and prints what
 * PayHero reports. The shilling goes to your own PayHero channel.
 */
const {
  PAYHERO_API_USERNAME: user = "",
  PAYHERO_API_PASSWORD: pass = "",
  PAYHERO_AUTH_TOKEN: token = "",
  PAYHERO_CHANNEL_ID: channel = "",
  PAYHERO_BASE_URL: base = "https://backend.payhero.co.ke/api/v2",
} = process.env;

const fail = (m) => {
  console.error(`✗ ${m}`);
  process.exit(1);
};

if (!token && !(user && pass)) fail("Set PAYHERO_API_USERNAME and PAYHERO_API_PASSWORD (or PAYHERO_AUTH_TOKEN).");
if (!/^\d+$/.test(channel)) fail("Set PAYHERO_CHANNEL_ID to the number from Payment Channels → My Payment Channels.");
const m = (process.argv[2] ?? "").replace(/[^\d]/g, "").match(/^(?:254|0)?([17]\d{8})$/);
if (!m) fail("Pass the phone to test with, like: npm run payhero:check -- 0712345678");

const auth = token ? (token.startsWith("Basic ") ? token : `Basic ${token}`) : `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
const api = async (path, init) => {
  const res = await fetch(`${base.replace(/\/$/, "")}/${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

console.log(`Sending a KES 1 prompt to 0${m[1]} through channel ${channel}…`);
const start = await api("payments", {
  method: "POST",
  body: JSON.stringify({
    amount: 1,
    phone_number: `0${m[1]}`,
    channel_id: Number(channel),
    provider: "m-pesa",
    external_reference: `check-${Date.now()}`,
    customer_name: "Suppli Afya setup check",
  }),
});
if (start.status === 401 || start.status === 403) fail(`PayHero refused the credentials (${start.status}). Check the API username and password.`);
if (!start.body.reference) fail(`PayHero didn't start the payment (${start.status}): ${JSON.stringify(start.body)}`);
console.log(`✓ Credentials and channel work. Reference ${start.body.reference}. Enter your PIN on the phone.`);

for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const s = await api(`transaction-status?reference=${encodeURIComponent(start.body.reference)}`);
  const status = String(s.body.status ?? "").toUpperCase();
  if (status === "SUCCESS") {
    console.log(`✓ Paid. M-Pesa receipt ${s.body.provider_reference ?? s.body.third_party_reference ?? "(not given)"}. PayHero is ready.`);
    process.exit(0);
  }
  if (status === "FAILED") fail(`The prompt didn't complete: ${JSON.stringify(s.body)}`);
}
fail("No answer after 90 seconds. The credentials work; check the phone and try again.");
