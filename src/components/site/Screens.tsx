"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Check, WhatsAppIcon } from "@/components/ui/icons";
import { KATE, ORDER_TOTAL, SARAH, SUGGESTED, kes } from "./story";

/*
 * The phone screens the homepage tells its story with. Two people, two kinds of screen:
 * what Sarah (the customer) sees is Kate's page, calm and consumer-like; what Kate (the
 * distributor) sees is her workspace, plainer and denser. Each mirrors the real product.
 * `live` adds small entrances for the looping hero; without it a screen is simply drawn, so it
 * reads the same in the HTML, without JavaScript and with reduced motion.
 */

const ease = [0.22, 1, 0.36, 1] as const;

export function MockPhone({ children, className, size = "md" }: { children: ReactNode; className?: string; size?: "md" | "sm" }) {
  return (
    <div
      className={clsx(
        "relative mx-auto shrink-0 border-[#0b1711] bg-cream shadow-float",
        size === "md"
          ? "h-[33rem] w-[17rem] rounded-[2.6rem] border-[9px] sm:h-[36rem] sm:w-[18.5rem]"
          : "h-[27rem] w-[16rem] rounded-[2.3rem] border-[8px]",
        className,
      )}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b1711]" />
      <div className="relative h-full overflow-hidden rounded-[2rem]">{children}</div>
    </div>
  );
}

/** Who a screen belongs to: Sarah's phone or Kate's workspace. */
export function ViewLabel({ who }: { who: "customer" | "distributor" }) {
  return who === "customer" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-[0.75rem] font-semibold text-ink-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-clay" /> What {SARAH.name} sees
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-[0.75rem] font-semibold text-cream">
      <span className="h-1.5 w-1.5 rounded-full bg-sage" /> What {KATE.first} sees
    </span>
  );
}

function Fade({ live, delay = 0, className, children }: { live?: boolean; delay?: number; className?: string; children: ReactNode }) {
  if (!live) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease }}
    >
      {children}
    </motion.div>
  );
}

function Monogram({ className }: { className?: string }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-full bg-forest font-display tracking-[0.02em] text-cream", className)}>
      {KATE.initials}
    </span>
  );
}

// ------------------------------------------------------------------ Sarah's side: Kate's page

/** A numbered pointer, used when a section explains the parts of Kate's page. */
function Marker({ n, show, className = "right-0" }: { n: number; show?: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className={`absolute ${className} top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-clay font-display text-[0.7rem] text-cream ring-2 ring-cream`}>
      {n}
    </span>
  );
}

function UrlBar({ markers }: { markers?: boolean }) {
  return (
    <div className="bg-paper px-3 pb-2 pt-8">
      <div className="relative flex items-center gap-1.5 rounded-full bg-sand/70 px-3 py-1.5 text-[0.62rem] text-ink-soft">
        <Marker n={1} show={markers} className="right-1" />
        <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0">
          <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" fill="currentColor" />
          <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        <span className="truncate">{KATE.link}</span>
      </div>
    </div>
  );
}

/** The top of Kate's page: who it belongs to, and one clear place to start. */
export function PageScreen({ pressed, markers }: { pressed?: boolean; markers?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <UrlBar markers={markers} />
      <div className="px-4 pt-6">
        <div className="relative flex items-center gap-2.5">
          <Marker n={2} show={markers} />
          <Monogram className="h-11 w-11 text-[1rem]" />
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-[1.05rem] text-ink">{KATE.name}</div>
            <div className="truncate text-[0.66rem] text-ink-mute">{KATE.title}</div>
          </div>
        </div>
        <span className="mt-6 inline-block rounded-full bg-sage-soft px-2.5 py-0.5 text-[0.6rem] font-semibold text-forest">About 3 minutes</span>
        <div className="mt-3 font-display text-[1.45rem] leading-[1.08] tracking-[-0.02em] text-ink">Let&apos;s find what actually suits you.</div>
        <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-soft">
          {KATE.first} uses this short assessment to understand what you&apos;re looking for before suggesting anything.
        </p>
        <div className="relative mt-5">
          <Marker n={3} show={markers} />
          <div
            className={clsx(
              "inline-flex h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-[0.78rem] font-semibold text-cream transition-transform",
              pressed && "scale-95 ring-4 ring-sage/60",
            )}
          >
            Start
            <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
              <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="relative mt-3.5 flex items-center gap-1.5 text-[0.7rem] font-semibold text-forest">
          <Marker n={4} show={markers} />
          <WhatsAppIcon className="h-3.5 w-3.5" /> Or message {KATE.first} directly
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between px-4 pb-4 text-[0.55rem] text-ink-mute">
        <span className="inline-flex items-center gap-1">
          Powered by <LogoMark className="h-3 w-3" /> Suppli Afya
        </span>
        <span>Privacy</span>
      </div>
    </div>
  );
}

function Bar({ fill }: { fill: number[] }) {
  return (
    <div className="flex gap-1">
      {fill.map((f, i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-forest" style={{ width: `${f * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

/** "What would you most like to improve?", with Sarah's two goals picked in order. */
export function QuestionScreen({ live }: { live?: boolean }) {
  const opts = ["Energy", "Immunity", "Digestion", "Joints & bones", "Sleep & stress", "Blood sugar"];
  const picks: Record<string, number> = { Energy: 1, "Joints & bones": 2 };
  const on = { borderColor: "#1e3a2b", backgroundColor: "rgb(223 231 214 / 0.8)" };
  const off = { borderColor: "rgb(22 36 28 / 0.12)", backgroundColor: "#fbf8f2" };
  return (
    <div className="absolute inset-0 px-4 pt-9">
      <Bar fill={[1, 0.4, 0, 0]} />
      <div className="mt-5 font-display text-[1.3rem] leading-[1.15] text-ink">What would you most like to improve?</div>
      <div className="mt-1 text-[0.7rem] text-ink-mute">Choose up to three, most important first.</div>
      <div className="mt-4 grid gap-1.5">
        {opts.map((o) => {
          const rank = picks[o];
          const at = rank ? 0.7 + rank * 0.7 : 0;
          return (
            <motion.div
              key={o}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[0.8rem] font-medium"
              initial={live ? off : false}
              animate={rank ? on : off}
              transition={{ delay: live ? at : 0, duration: 0.3 }}
            >
              <motion.span
                className="grid h-4 w-4 place-items-center rounded-[5px] border text-[0.6rem] font-bold text-cream"
                initial={live ? { backgroundColor: "#ffffff", borderColor: "rgb(22 36 28 / 0.3)" } : false}
                animate={rank ? { backgroundColor: "#1e3a2b", borderColor: "#1e3a2b" } : { backgroundColor: "#ffffff", borderColor: "rgb(22 36 28 / 0.3)" }}
                transition={{ delay: live ? at : 0, duration: 0.3 }}
              >
                {rank ?? ""}
              </motion.span>
              <span className={clsx(!rank && "text-ink-soft")}>{o}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 h-9 rounded-full bg-forest text-center text-[0.8rem] font-semibold leading-9 text-cream">Continue</div>
    </div>
  );
}

/** What could fit, and why, then the way back to Kate. */
export function SuggestionsScreen({ live, highlight }: { live?: boolean; highlight?: boolean }) {
  return (
    <div className="absolute inset-0 px-4 pt-9">
      <Bar fill={[1, 1, 1, 1]} />
      <div className="mt-5 text-[0.65rem] font-semibold text-clay">Your plan · SA-7K3Q</div>
      <div className="mt-1 font-display text-[1.4rem] leading-[1.1] text-ink">{SARAH.name}, here&apos;s your plan.</div>
      <div className="mt-1 text-[0.7rem] leading-snug text-ink-soft">Your main goal is energy, followed by joints &amp; bones.</div>
      <div className="mt-3 grid gap-2">
        {SUGGESTED.map((it, i) => (
          <Fade key={it.name} live={live} delay={0.3 + i * 0.25} className="rounded-2xl border border-ink/10 bg-paper p-3">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-7 shrink-0 rounded-md" style={{ background: it.tone }} />
              <div className="min-w-0">
                <div className="truncate font-display text-[0.95rem] leading-tight text-ink">{it.name}</div>
                <span className="mt-0.5 inline-block rounded-full bg-sage-soft px-1.5 py-px text-[0.58rem] font-semibold text-forest">{it.goal}</span>
              </div>
            </div>
            <div className="mt-2 text-[0.62rem] leading-snug text-ink-soft">{it.why}</div>
          </Fade>
        ))}
      </div>
      <Fade live={live} delay={1} className="mt-3 rounded-2xl bg-forest p-3 text-cream">
        <div className="font-display text-[0.95rem] leading-tight">Want help deciding? Talk it through with {KATE.first}</div>
        <div className="mt-1 text-[0.6rem] text-cream/70">{KATE.first} will confirm prices and answer your questions.</div>
        <div
          className={clsx(
            "mt-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-wa text-[0.72rem] font-semibold text-[#06331f] transition-transform",
            highlight && "scale-[1.03] ring-4 ring-wa/40",
          )}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Send my plan to {KATE.first}
        </div>
      </Fade>
    </div>
  );
}

function ChatHeader({ with: who, initial }: { with: string; initial: string }) {
  return (
    <div className="flex items-center gap-2 bg-wa-deep px-3 pb-2.5 pt-8 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dfe5e7] text-xs font-semibold text-wa-deep">{initial}</span>
      <div className="leading-tight">
        <div className="text-[0.8rem] font-semibold">{who}</div>
        <div className="text-[0.6rem] text-white/75">online</div>
      </div>
    </div>
  );
}

function Bubble({ mine, time, live, delay, children }: { mine?: boolean; time: string; live?: boolean; delay?: number; children: ReactNode }) {
  return (
    <Fade
      live={live}
      delay={delay}
      className={clsx(
        "mt-2 max-w-[88%] rounded-lg px-2.5 pb-4 pt-2 text-[0.66rem] leading-[1.45] text-[#111b21] shadow-sm",
        mine ? "ml-auto rounded-tr-none bg-wa-bubble" : "rounded-tl-none bg-white",
      )}
    >
      {children}
      <div className="-mb-3 mt-0.5 text-right text-[0.55rem] text-[#54656f]">
        {time}
        {mine && " ✓✓"}
      </div>
    </Fade>
  );
}

/** WhatsApp on Sarah's phone: her answers go with her, then Kate picks it up. */
export function ChatScreen({ stage = 2, live }: { stage?: 1 | 2 | 3; live?: boolean }) {
  const [coffee, joints] = SUGGESTED;
  return (
    <div className="absolute inset-0 flex flex-col bg-wa-bg">
      <ChatHeader with={KATE.name} initial="K" />
      <div className="flex-1 px-2.5 pt-2">
        <Bubble mine time="9:14 pm" live={live} delay={0.35}>
          Hi {KATE.first}, I&apos;ve just done the assessment on your page.
          <br />
          <br />
          <b>About me:</b> {SARAH.name}, {SARAH.age}
          <br />
          <b>My goals:</b> 1. Energy 2. Joints
          <br />
          <b>Suggested plan:</b> {coffee.name}, {joints.name}
          <br />
          <br />
          Could you tell me the prices and how to get started?
        </Bubble>
        {stage >= 2 && (
          <Bubble time="9:16 pm" live={live} delay={live ? 2.4 : 0}>
            Hi {SARAH.name}! The coffee is {kes(coffee.price)} and ArthroXtra is {kes(joints.price)}. I can deliver both tomorrow.
            Shall I?
          </Bubble>
        )}
        {stage >= 3 && (
          <Bubble mine time="9:18 pm" live={live} delay={live ? 3.6 : 0}>
            Yes please 🙏 Sending it on M-Pesa now.
          </Bubble>
        )}
      </div>
    </div>
  );
}

function QrEye({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="currentColor" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
}

/** A decorative QR code: finder squares and a fixed pattern (never a real link). */
export function FakeQr({ className }: { className?: string }) {
  const n = 21;
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (!finder(x, y) && (x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} aria-hidden className={clsx("bg-white text-ink", className)} shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      <QrEye x={0} y={0} />
      <QrEye x={n - 7} y={0} />
      <QrEye x={0} y={n - 7} />
    </svg>
  );
}

/** Sarah points her camera at Kate's card; the phone offers to open the link. */
export function ScanScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#1d1f1e]">
      <div className="relative flex-1">
        <div className="absolute inset-x-6 top-24 -rotate-[4deg] rounded-xl bg-paper p-3 shadow-float">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="min-w-0">
              <div className="truncate font-display text-[0.9rem] leading-tight text-ink">{KATE.name}</div>
              <div className="truncate text-[0.5rem] text-ink-mute">{KATE.title}</div>
              <div className="mt-3 font-display text-[0.7rem] leading-snug text-ink">Not sure where to start? Take my short assessment.</div>
            </div>
            <FakeQr className="h-16 w-16 rounded" />
          </div>
        </div>
        <div aria-hidden className="absolute left-1/2 top-[8.4rem] h-28 w-28 -translate-x-1/2 rounded-2xl border-2 border-[#ffd60a]/90" />
      </div>
      <div className="mx-3 mb-5 flex items-center gap-2 rounded-2xl bg-[#ffd60a] px-3 py-2 text-[0.66rem] font-semibold text-[#1d1f1e]">
        <span className="min-w-0 flex-1 truncate">Open {KATE.link}</span>
        <svg viewBox="0 0 12 12" aria-hidden className="h-3 w-3 shrink-0">
          <path d="M4 2.5h5.5V8M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** Reorder time, back on Sarah's phone: Kate reaches her before she runs out. */
export function ReorderScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-wa-bg">
      <ChatHeader with={KATE.name} initial="K" />
      <div className="flex-1 px-2.5 pt-2">
        <div className="mx-auto mt-1 w-fit rounded-md bg-white/80 px-2 py-0.5 text-[0.55rem] text-[#54656f] shadow-sm">About a month later</div>
        <Bubble time="10:02 am" live={live} delay={0.3}>
          Habari {SARAH.name}! It&apos;s about time for your next {SUGGESTED[0].short}. How has it been going? I can set another one
          aside for you.
        </Bubble>
        <Bubble mine time="10:05 am" live={live} delay={live ? 1.6 : 0}>
          It&apos;s been good, my afternoons are better 🙂 Same again please!
        </Bubble>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Kate's side: her workspace

function WorkspaceTop({ title, back }: { title: string; back?: string }) {
  return (
    <div className="border-b border-ink/10 bg-paper px-4 pb-3 pt-9">
      {back && <div className="text-[0.6rem] font-semibold text-ink-mute">‹ {back}</div>}
      <div className="mt-0.5 font-display text-[1.2rem] leading-tight text-ink">{title}</div>
    </div>
  );
}

/** Kate's status update, with her own link in it. */
export function StatusScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b6b58]">
      <div className="flex items-center justify-between px-4 pt-9 text-[0.6rem] font-semibold text-white/80">
        <span>✕</span>
        <span>My status</span>
        <span>Aa</span>
      </div>
      <div className="flex flex-1 items-center px-6 text-center font-display text-[1.25rem] leading-snug text-white">
        Not sure which supplements suit you? Answer a few quick questions on my page and see what could help, and why 👇
      </div>
      <div className="mx-4 mb-3 truncate rounded-lg bg-white/15 px-3 py-2 text-[0.62rem] text-white">{KATE.link}</div>
      <div className="flex items-center justify-between bg-black/20 px-4 py-3 text-[0.62rem] text-white/80">
        <span>Status · My contacts</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-wa text-[#06331f]">➤</span>
      </div>
    </div>
  );
}

/** The order Kate recorded, paid by M-Pesa. */
export function OrderScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <WorkspaceTop title={ORDER_TOTAL} back="Orders" />
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[0.6rem] font-semibold text-forest">Paid</span>
          <span className="text-[0.62rem] text-ink-mute">
            {SARAH.name} · {SARAH.phone}
          </span>
        </div>
        <div className="mt-3 rounded-xl border border-ink/10 bg-paper text-[0.66rem]">
          {SUGGESTED.map((p) => (
            <div key={p.name} className="flex justify-between border-b border-ink/10 px-3 py-2 text-ink">
              <span>1 × {p.short}</span>
              <span className="text-ink-soft">{kes(p.price)}</span>
            </div>
          ))}
          <div className="flex justify-between px-3 py-2 font-semibold text-ink">
            <span>Total</span>
            <span>{ORDER_TOTAL}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#e3f4e0] px-3 py-2 text-[0.64rem] text-[#1f5a2b]">
          <Check className="h-3.5 w-3.5" /> Paid by M-Pesa · SJK4H7Q2XP
        </div>
        <div className="mt-3 text-[0.62rem] text-ink-soft">
          Likely to need more: <b className="text-ink">in about a month</b>
        </div>
      </div>
    </div>
  );
}

/** Sarah's record: everything that happened, in one place. */
export function RecordScreen() {
  const rows = [
    ["Did the assessment", "on your page, Tuesday night"],
    ["Looking for", SARAH.goals.join(", ")],
    ["Suggested", SUGGESTED.map((p) => p.short).join(", ")],
    ["Messaged you", "with her answers, on WhatsApp"],
    ["Bought", `${ORDER_TOTAL}, paid by M-Pesa`],
    ["Next", "Check in after two weeks"],
  ];
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <WorkspaceTop title={SARAH.name} back="Customers" />
      <div className="px-4 pt-3">
        <div className="text-[0.6rem] text-ink-mute">
          {SARAH.phone} · Came through your page
        </div>
        <ol className="mt-3 grid gap-0">
          {rows.map(([k, v], i) => (
            <li key={k} className="relative grid grid-cols-[0.9rem_1fr] gap-2 pb-3">
              <span className="relative flex justify-center">
                <span className={clsx("mt-1 h-2 w-2 rounded-full", i === rows.length - 1 ? "bg-clay" : "bg-forest")} />
                {i < rows.length - 1 && <span className="absolute top-3 h-full w-px bg-ink/15" />}
              </span>
              <span className="leading-snug">
                <span className="block text-[0.6rem] font-semibold text-ink-mute">{k}</span>
                <span className="block text-[0.7rem] text-ink">{v}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Kate's Today list, two weeks on: a check-in with a message ready. */
export function TodayScreen({ live }: { live?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-cream">
      <div className="px-4 pt-9">
        <div className="text-[0.6rem] font-semibold text-clay">Two weeks later</div>
        <div className="font-display text-[1.25rem] leading-tight text-ink">Good morning, {KATE.first}.</div>
        <div className="text-[0.64rem] text-ink-soft">1 person needs you today.</div>
      </div>
      <Fade live={live} delay={0.3} className="mx-3 mt-4 rounded-2xl border border-ink/10 bg-paper p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sand font-display text-[0.8rem] text-ink">S</span>
          <span className="text-[0.75rem] font-semibold text-ink">{SARAH.name}</span>
          <span className="rounded-full bg-sand px-1.5 py-px text-[0.55rem] font-semibold text-ink-soft">Check in</span>
        </div>
        <div className="mt-1.5 text-[0.62rem] leading-snug text-ink-soft">
          Started {SUGGESTED[0].short} two weeks ago. A good time to ask how it&apos;s going.
        </div>
        <div className="mt-2 rounded-lg bg-wa-bubble px-2.5 py-2 text-[0.62rem] leading-snug text-[#111b21]">
          Hi {SARAH.name}, it&apos;s been a couple of weeks on the coffee. How are you finding it?
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-wa px-2.5 py-1 text-[0.6rem] font-semibold text-[#06331f]">
            <WhatsAppIcon className="h-3 w-3" /> Send on WhatsApp
          </span>
          <span className="rounded-full border border-ink/15 px-2.5 py-1 text-[0.6rem] font-semibold text-ink">Mark done</span>
        </div>
      </Fade>
    </div>
  );
}
