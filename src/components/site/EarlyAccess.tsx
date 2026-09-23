"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { site } from "@/config/site";
import { whatsappLink } from "@/engine";
import { Button, buttonClass } from "@/components/ui/Button";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";

const SIZES = ["Under 30", "30 to 100", "100 to 300", "More than 300"];
const HARDEST = [
  "Getting new customers",
  "Following up with people",
  "Getting paid on time",
  "Getting repeat orders",
  "Keeping track of everything",
];

const field =
  "mt-2 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-[1rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-forest";

export function EarlyAccess() {
  const [form, setForm] = useState({ name: "", phone: "", town: "", size: "", hardest: "" });
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const [tried, setTried] = useState(false);
  const phoneDigits = form.phone.replace(/[\s-]/g, "");
  const errors = {
    name: form.name.trim().length > 1 ? null : "Please add your name.",
    phone: /^(?:\+?254|0)?[17]\d{8}$/.test(phoneDigits) ? null : "Use a Kenyan number, like 0712 345 678.",
    town: form.town.trim().length > 1 ? null : "Which town do you sell in?",
  };
  const valid = !errors.name && !errors.phone && !errors.town;
  const err = (k: keyof typeof errors) =>
    tried && errors[k] ? <span className="mt-1.5 block text-[0.8rem] font-medium text-clay">{errors[k]}</span> : null;

  const details = [
    `*Name:* ${form.name.trim()}`,
    `*WhatsApp:* ${form.phone.trim()}`,
    `*Town:* ${form.town.trim()}`,
    form.size ? `*Customers:* ${form.size}` : null,
    form.hardest ? `*Hardest part right now:* ${form.hardest}` : null,
  ].filter(Boolean);
  const message = ["Hi Suppli Afya, I'd like early access.", "", ...details].join("\n");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    setSent(message);
    if (site.teamWhatsApp) window.open(whatsappLink(site.teamWhatsApp, message), "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sent ?? "");
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="early-access" className="py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <Reveal>
            <div className="eyebrow">Early access</div>
            <h2 className="display-lg mt-5 max-w-[14ch] text-ink">We&apos;re starting with a small group of distributors</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="lede mt-7 grid max-w-[32rem] gap-5">
              <p>
                We&apos;d rather set up a few distributors properly than sign up hundreds and leave them to work it out.
                Early access includes setting up your link and QR cards, and moving your existing customers in from your
                phone, notebook or spreadsheet.
              </p>
              <p>Tell us a little about how you sell and we&apos;ll get back to you on WhatsApp.</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] border border-ink/10 bg-sand/50 p-6 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {sent === null ? (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid gap-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-[0.9rem] font-semibold text-ink">
                      Your name
                      <input className={field} value={form.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Grace Wambui" />
                      {err("name")}
                    </label>
                    <label className="block text-[0.9rem] font-semibold text-ink">
                      WhatsApp number
                      <input
                        className={field}
                        value={form.phone}
                        onChange={set("phone")}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="07XX XXX XXX"
                      />
                      {err("phone")}
                    </label>
                  </div>
                  <label className="block text-[0.9rem] font-semibold text-ink">
                    Town
                    <input className={field} value={form.town} onChange={set("town")} autoComplete="address-level2" placeholder="e.g. Thika" />
                    {err("town")}
                  </label>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-[0.9rem] font-semibold text-ink">
                      How many customers do you have?
                      <select className={clsx(field, !form.size && "text-ink/40")} value={form.size} onChange={set("size")}>
                        <option value="">Choose one</option>
                        {SIZES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[0.9rem] font-semibold text-ink">
                      What&apos;s hardest right now?
                      <select className={clsx(field, !form.hardest && "text-ink/40")} value={form.hardest} onChange={set("hardest")}>
                        <option value="">Choose one</option>
                        {HARDEST.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Button type="submit" size="lg" variant={site.teamWhatsApp ? "whatsapp" : "primary"} className="mt-2 w-full sm:w-auto">
                    {site.teamWhatsApp && <WhatsAppIcon />}
                    {site.teamWhatsApp ? "Apply on WhatsApp" : "Apply for early access"}
                  </Button>
                  <p className="text-[0.8rem] leading-relaxed text-ink-mute">
                    We only use these details to get back to you about early access.
                  </p>
                </motion.form>
              ) : (
                <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-forest text-cream">
                    <Check />
                  </div>
                  <h3 className="mt-5 font-display text-[1.8rem] leading-tight text-ink">
                    {site.teamWhatsApp ? "Your message is ready in WhatsApp" : "Thank you. Here's your application."}
                  </h3>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">
                    {site.teamWhatsApp
                      ? "Press send in WhatsApp and we'll reply there. If WhatsApp didn't open, use the button below."
                      : "Copy these details and send them to the Suppli Afya team on WhatsApp."}
                  </p>
                  <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-paper p-4 font-sans text-[0.9rem] leading-relaxed text-ink">{sent}</pre>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {site.teamWhatsApp ? (
                      <a
                        className={buttonClass("whatsapp", "md")}
                        href={whatsappLink(site.teamWhatsApp, sent)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsAppIcon /> Open WhatsApp
                      </a>
                    ) : (
                      <Button onClick={copy}>{copied ? "Copied" : "Copy message"}</Button>
                    )}
                    <Button variant="ghost" onClick={() => setSent(null)}>
                      Edit details
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
