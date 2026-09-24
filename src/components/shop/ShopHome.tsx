"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CATALOGUE, GOALS, GOALS_BY_ID, PRODUCTS_BY_ID, type GoalId, type Product } from "@/engine";
import { helloMessage } from "@/lib/shop";
import { Monogram, WaGlyph, WhatsAppAction, waButton } from "./bits";
import { ProductCard } from "./ProductCard";
import { ProductVisual } from "./ProductVisual";
import { useShop } from "./ShopProvider";

const ease = [0.22, 1, 0.36, 1] as const;
export const shopX = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function ShopHome() {
  const [goal, setGoal] = useState<GoalId | null>(null);
  const pick = (g: GoalId | null) => {
    setGoal(g);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <>
      <Hero />
      <Needs onPick={pick} />
      <Catalogue goal={goal} setGoal={setGoal} />
      <Ordering />
      <About />
      <Answers />
    </>
  );
}

// ---------------------------------------------------------------- hero

function Hero() {
  const { shop, base } = useShop();
  const d = shop.distributor;
  const reduce = useReducedMotion();
  const featured = useMemo(() => {
    const f = shop.productIds.filter((id) => shop.prices[id]?.featured).map((id) => PRODUCTS_BY_ID[id]);
    return (f.length >= 3 ? f : [...f, ...CATALOGUE.filter((p) => !f.includes(p))]).slice(0, 3);
  }, [shop]);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.08 + i * 0.08, ease },
  });

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-8 sm:pt-14 lg:pb-24 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 -z-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(223_231_214/0.9),transparent)]"
      />
      <div className={clsx(shopX, "relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14")}>
        <div>
          <motion.p {...rise(0)} className="eyebrow">
            BF Suma products{d.area ? ` · ${d.area}` : ""}
          </motion.p>
          <motion.h1
            {...rise(1)}
            className="mt-5 max-w-[15ch] font-display text-[2.6rem] leading-[1.02] tracking-[-0.028em] text-ink sm:text-[3.6rem] lg:text-[4.3rem]"
          >
            Supplements that suit you, from someone you can ask.
          </motion.h1>
          <motion.p {...rise(2)} className="lede mt-5 max-w-[34rem]">
            {d.firstName} helps you choose, answers your questions and delivers to you. Not sure where to start? A three-minute check
            suggests what fits your goals and says why. Know what you want? Browse and order below.
          </motion.p>
          <motion.div {...rise(3)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`${base}/check`}
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-forest px-7 text-[1rem] font-semibold text-cream transition hover:bg-forest-deep active:scale-[0.99]"
            >
              Help me choose
              <span className="rounded-full bg-cream/15 px-2 py-0.5 text-[0.75rem] font-medium">3 min</span>
            </Link>
            <a
              href="#products"
              className="inline-flex h-14 items-center justify-center rounded-full border border-forest/25 px-7 text-[1rem] font-semibold text-forest transition hover:border-forest/60"
            >
              Browse products
            </a>
          </motion.div>
          <motion.div {...rise(4)} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.88rem] text-ink-soft">
            <WhatsAppAction
              message={helloMessage(d.firstName)}
              className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline"
            >
              <WaGlyph className="h-4 w-4 text-[#1faa59]" /> Ask {d.firstName} on WhatsApp
            </WhatsAppAction>
            {shop.details.hours && <span className="text-ink-mute">Replies {shop.details.hours}</span>}
          </motion.div>
        </div>

        {/* A still life: the most asked-for products on one shelf, with a word from the distributor. */}
        <div className="relative mx-auto w-full max-w-[36rem]">
          <motion.div style={{ y: lift }}>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease }}
              className="relative aspect-[6/5] overflow-hidden rounded-[2rem] bg-[radial-gradient(110%_80%_at_50%_15%,#fbf8f2_0%,#ebe3d3_100%)] shadow-[0_40px_80px_-50px_rgb(22_36_28/0.5)]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(to_bottom,rgb(22_36_28/0.04),rgb(22_36_28/0.08))]"
              />
              <div aria-hidden className="absolute inset-x-[8%] top-[80%] h-px bg-ink/10" />
              {featured.map((p, i) => {
                const pos = [
                  "left-[1%] w-[42%] bottom-[4%]",
                  "left-1/2 w-[54%] -translate-x-1/2 bottom-[2%] z-10",
                  "right-[1%] w-[42%] bottom-[4%]",
                ][i];
                return (
                  <div key={p.id} className={clsx("absolute", pos)}>
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.35 + i * 0.12, ease }}
                    >
                      <Link href={`${base}/p/${p.id}`} aria-label={p.name} className="group block">
                        <ProductVisual
                          product={p}
                          size={i === 1 ? "hero" : "card"}
                          priority
                          bare
                          className="transition-transform duration-700 ease-[var(--ease-soft)] group-hover:-translate-y-1.5"
                        />
                      </Link>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
          {shop.details.intro && (
            <motion.figure
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="relative z-20 -mt-2 ml-auto mr-3 max-w-[21rem] sm:-mt-8 rounded-[1.25rem] border border-ink/[0.08] bg-paper p-4 shadow-float sm:-mr-6"
            >
              <blockquote className="text-[0.92rem] leading-relaxed text-ink">&ldquo;{shop.details.intro}&rdquo;</blockquote>
              <figcaption className="mt-3 flex items-center gap-2 text-[0.8rem] text-ink-soft">
                <Monogram name={d.name} className="h-6 w-6 text-[0.62rem]" />
                {d.name}
              </figcaption>
            </motion.figure>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- needs

function Needs({ onPick }: { onPick: (g: GoalId) => void }) {
  const { shop, base } = useShop();
  const counts = useMemo(() => {
    const c: Partial<Record<GoalId, number>> = {};
    for (const id of shop.productIds) for (const g of PRODUCTS_BY_ID[id].goals) c[g] = (c[g] ?? 0) + 1;
    return c;
  }, [shop]);
  const goals = GOALS.filter((g) => counts[g.id]);
  return (
    <section aria-labelledby="needs-title" className="border-y border-ink/[0.07] bg-paper/50 py-14 sm:py-20">
      <div className={shopX}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="needs-title" className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.5rem]">
              What would you like help with?
            </h2>
            <p className="mt-2 max-w-xl text-[1rem] leading-relaxed text-ink-soft">
              Start from what you want to feel better, and see the products people use for it.
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <Link
            href={`${base}/check`}
            className="group col-span-2 flex flex-col justify-between rounded-[1.25rem] bg-forest p-5 text-cream transition hover:bg-forest-deep sm:col-span-1 lg:row-span-2"
          >
            <span className="text-[0.78rem] font-semibold text-sage">Not sure?</span>
            <span className="mt-3 block sm:mt-6">
              <span className="block font-display text-[1.55rem] leading-tight">Answer a few questions instead</span>
              <span className="mt-2 block text-[0.88rem] leading-relaxed text-cream/75">
                About your goals, routine and health. You&apos;ll see what fits, what doesn&apos;t, and why.
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold">
                Start the check <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </span>
          </Link>
          {goals.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onPick(g.id)}
              className="group flex flex-col justify-between rounded-[1.1rem] border border-ink/10 bg-cream p-3.5 text-left transition hover:border-forest/40 hover:bg-paper active:scale-[0.99] sm:rounded-[1.25rem] sm:p-4"
            >
              <span className="text-[0.95rem] font-semibold leading-snug text-ink">{g.label}</span>
              <span className="mt-1 hidden text-[0.82rem] leading-snug text-ink-mute sm:block">{g.hint}</span>
              <span className="mt-1.5 text-[0.75rem] font-semibold text-forest sm:mt-3">
                {counts[g.id]} product{counts[g.id]! > 1 ? "s" : ""} →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- catalogue

function Catalogue({ goal, setGoal }: { goal: GoalId | null; setGoal: (g: GoalId | null) => void }) {
  const { shop } = useShop();
  const [query, setQuery] = useState("");
  const all = useMemo(
    () =>
      shop.productIds
        .map((id) => PRODUCTS_BY_ID[id])
        .sort((a, b) => Number(Boolean(shop.prices[b.id]?.featured)) - Number(Boolean(shop.prices[a.id]?.featured))),
    [shop],
  );
  const q = query.trim().toLowerCase();
  const shown = all.filter(
    (p) =>
      (!goal || p.goals.includes(goal)) &&
      (!q ||
        `${p.name} ${p.line} ${p.keyIngredients.join(" ")} ${p.goals.map((g) => GOALS_BY_ID[g].label).join(" ")}`
          .toLowerCase()
          .includes(q)),
  );
  const goalsInShop = GOALS.filter((g) => all.some((p) => p.goals.includes(g.id)));

  return (
    <section id="products" aria-labelledby="products-title" className="scroll-mt-16 py-14 sm:py-20">
      <div className={shopX}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="products-title" className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.5rem]">
              {goal ? `For ${GOALS_BY_ID[goal].label.toLowerCase()}` : `${shop.distributor.firstName}'s products`}
            </h2>
            <p className="mt-2 text-[0.95rem] text-ink-soft">
              {shown.length} product{shown.length === 1 ? "" : "s"}
              {goal ? "" : ". The most asked-for come first."}
            </p>
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search products</span>
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
              aria-hidden
            >
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="m13.2 13.2 3.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or need"
              className="h-12 w-full rounded-full border border-ink/15 bg-paper pl-11 pr-4 text-[0.95rem] text-ink outline-none transition placeholder:text-ink/40 focus:border-forest"
            />
          </label>
        </div>

        {/* Filter by need. Sticks under the header while you browse. */}
        <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-20 -mx-4 mt-6 bg-cream/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div role="group" aria-label="Filter by need" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            {[
              { id: null, label: "All" } as { id: GoalId | null; label: string },
              ...goalsInShop.map((g) => ({ id: g.id as GoalId | null, label: g.short })),
            ].map((g) => (
              <button
                key={g.id ?? "all"}
                type="button"
                aria-pressed={goal === g.id}
                onClick={() => setGoal(g.id)}
                className={clsx(
                  "relative h-10 shrink-0 rounded-full px-4 text-[0.88rem] font-semibold transition-colors",
                  goal === g.id ? "text-cream" : "border border-ink/12 bg-paper text-ink-soft hover:text-ink",
                )}
              >
                {goal === g.id && (
                  <motion.span
                    layoutId="need-pill"
                    className="absolute inset-0 rounded-full bg-forest"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease }}
              >
                <ProductCard product={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {shown.length === 0 && (
          <div className="mt-6 rounded-[1.25rem] border border-dashed border-ink/15 p-8 text-center">
            <p className="text-ink-soft">Nothing matches &ldquo;{query}&rdquo;.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGoal(null);
              }}
              className="mt-3 font-semibold text-forest underline underline-offset-4"
            >
              Show everything
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- ordering

function Ordering() {
  const { shop } = useShop();
  const d = shop.distributor;
  const s = shop.details;
  const pay = [
    s.mpesa &&
      `M-Pesa${s.mpesa.kind === "till" ? ` Till ${s.mpesa.number}` : s.mpesa.kind === "paybill" ? ` Paybill ${s.mpesa.number}` : ""}`,
    s.cashOnDelivery && "cash on delivery",
  ].filter(Boolean);
  const steps = [
    {
      title: "Choose",
      body: "Add products here, or take the health check and order the plan it suggests. No account needed.",
    },
    {
      title: `${d.firstName} confirms`,
      body: `${d.firstName} calls or messages you to confirm what you ordered, the total and when it will reach you${s.hours ? `. Replies ${s.hours}` : ""}.`,
    },
    {
      title: "Pay and receive",
      body: `${pay.length ? `Pay by ${pay.join(" or ")}` : "Pay the way you agree"}. ${s.delivery ?? "Delivery or collection is arranged with you."}`,
    },
  ];
  return (
    <section id="ordering" aria-labelledby="ordering-title" className="scroll-mt-16 bg-forest py-16 text-cream sm:py-24">
      <div className={shopX}>
        <h2 id="ordering-title" className="max-w-[18ch] font-display text-[2rem] leading-tight tracking-[-0.02em] sm:text-[2.6rem]">
          How ordering from {d.firstName} works
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((st, i) => (
            <li key={st.title} className="border-t border-cream/15 pt-5">
              <span className="font-display text-[1.1rem] text-sage">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-[1.15rem] font-semibold">{st.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/75">{st.body}</p>
            </li>
          ))}
        </ol>
        {(s.deliveryFee || s.pickup) && (
          <dl className="mt-10 grid gap-4 rounded-[1.25rem] bg-cream/[0.06] p-5 text-[0.92rem] sm:grid-cols-2">
            {s.deliveryFee && (
              <div>
                <dt className="font-semibold text-cream">Delivery cost</dt>
                <dd className="mt-1 text-cream/75">{s.deliveryFee}</dd>
              </div>
            )}
            {s.pickup && (
              <div>
                <dt className="font-semibold text-cream">Collecting</dt>
                <dd className="mt-1 text-cream/75">{s.pickup}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- about

function About() {
  const { shop } = useShop();
  const d = shop.distributor;
  const s = shop.details;
  const facts = [
    d.area && { k: "Based in", v: d.area },
    s.hours && { k: "Replies", v: s.hours },
    s.languages && { k: "Speaks", v: s.languages },
  ].filter(Boolean) as { k: string; v: string }[];
  return (
    <section aria-labelledby="about-title" className="py-16 sm:py-24">
      <div className={clsx(shopX, "grid gap-10 md:grid-cols-[auto_1fr] md:gap-14")}>
        <Monogram name={d.name} className="h-24 w-24 text-[2rem] sm:h-32 sm:w-32 sm:text-[2.6rem]" />
        <div>
          <h2 id="about-title" className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.5rem]">
            About {d.firstName}
          </h2>
          {s.intro && <p className="prose-big mt-4 max-w-2xl text-ink">&ldquo;{s.intro}&rdquo;</p>}
          <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">
            {d.name} is an independent BF Suma distributor{d.area ? ` in ${d.area}` : ""}. {d.firstName} keeps a record of what you buy, so
            the next order is quick and you get a reminder before you run out.
          </p>
          {facts.length > 0 && (
            <dl className="mt-6 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="text-[0.78rem] font-semibold text-ink-mute">{f.k}</dt>
                  <dd className="mt-0.5 text-[0.95rem] text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-7 flex flex-wrap gap-2">
            <WhatsAppAction message={helloMessage(d.firstName)} className={clsx(waButton, "h-12 px-5 text-[0.95rem]")}>
              <WaGlyph className="h-5 w-5" /> Message {d.firstName}
            </WhatsAppAction>
            {d.whatsapp && !d.demo && (
              <a
                href={`tel:+${d.whatsapp.replace(/\D/g, "")}`}
                className="inline-flex h-12 items-center rounded-full border border-forest/25 px-5 text-[0.95rem] font-semibold text-forest"
              >
                Call
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- answers

function Answers() {
  const { shop } = useShop();
  const d = shop.distributor;
  const s = shop.details;
  const qa = [
    {
      q: "Are these genuine BF Suma products?",
      a: `${d.firstName} sells BF Suma products as an independent distributor. If you'd like to see the pack, batch number or expiry date before you pay, just ask.`,
    },
    {
      q: "Will a supplement fix my health problem?",
      a: "No supplement treats or cures illness, and nobody should tell you otherwise. Supplements can support a healthy routine over weeks and months. If something is worrying you, see a doctor first. The health check will tell you when that's the better step.",
    },
    {
      q: "I take medicine. Is that a problem?",
      a: `It can be. The health check asks about your medicines and leaves out products that don't mix with them. Tell ${d.firstName} what you take, and check with your doctor or pharmacist before starting anything new.`,
    },
    {
      q: "How do I pay?",
      a: [
        s.mpesa
          ? `By M-Pesa${s.mpesa.kind === "till" ? ` (Till ${s.mpesa.number})` : s.mpesa.kind === "paybill" ? ` (Paybill ${s.mpesa.number}${s.mpesa.account ? `, account ${s.mpesa.account}` : ""})` : ""}`
          : null,
        s.cashOnDelivery ? "or cash when it's delivered" : null,
      ]
        .filter(Boolean)
        .join(" ")
        .concat(
          s.mpesa || s.cashOnDelivery
            ? `. ${d.firstName} confirms the total with you first, so you never pay before you know what's coming.`
            : `${d.firstName} confirms the total and how to pay before you pay anything.`,
        ),
    },
    {
      q: "Can I change or cancel an order?",
      a: `Yes, until it's sent. Message ${d.firstName} and it's done.`,
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-labelledby="answers-title" className="border-t border-ink/[0.07] py-16 sm:py-24">
      <div className={clsx(shopX, "grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-14")}>
        <h2 id="answers-title" className="font-display text-[2rem] leading-tight tracking-[-0.02em] text-ink sm:text-[2.5rem]">
          Straight answers
        </h2>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {qa.map((x, i) => (
            <div key={x.q}>
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[1.05rem] font-semibold text-ink">{x.q}</span>
                <span
                  className={clsx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink-soft transition-transform duration-300",
                    open === i && "rotate-45",
                  )}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-5 text-[0.98rem] leading-relaxed text-ink-soft">{x.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type { Product };
