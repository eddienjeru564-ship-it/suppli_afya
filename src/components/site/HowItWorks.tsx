import clsx from "clsx";
import type { ReactNode } from "react";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import { QrCard } from "@/components/brand/QrCard";
import { Reveal } from "@/components/ui/Reveal";
import { qrSvg } from "@/lib/qr";
import { Pack, WaText } from "./Screens";
import { KATE, PLAN_REF, SARAH, SARAH_MESSAGE, SUGGESTED, kes } from "./story";

/** The opening of Sarah's message: who she is, her goals and her plan (the rest is in the real message). */
const OPENING = SARAH_MESSAGE.split("\n")
  .filter((l, i) => i === 0 || /^\*(About me|My goals|Suggested plan):\*/.test(l))
  .join("\n");

/**
 * The whole product in three steps, each with the real screen it happens on. The workspace, which
 * keeps the customer after the sale, follows straight after.
 */
export async function HowItWorks() {
  const [coffee, joints] = SUGGESTED;
  const url = `${site.url}/d/${DEMO_DISTRIBUTOR.slug}`;
  const svg = await qrSvg(url);
  const steps: { title: string; body: string; box?: string; visual: ReactNode }[] = [
    {
      title: "Share your link",
      body: "Put it on WhatsApp status, your bio, social pages or a QR card. It opens a page built around you and your business.",
      box: "bg-sand/50",
      visual: (
        <div className="grid h-full place-items-center pb-2 pr-2">
          <QrCard size="sm" name={KATE.name} tagline={KATE.title} url={url} displayUrl={KATE.link} svg={svg} />
        </div>
      ),
    },
    {
      title: "They get their own plan",
      body: "Customers answer a few short questions and see the products that fit what they're looking for, with a simple explanation of why each one was suggested.",
      visual: (
        <div className="flex h-full flex-col">
          <div className="text-[0.75rem] font-semibold text-clay">Your plan · {PLAN_REF}</div>
          <div className="mt-0.5 font-display text-[1.3rem] leading-tight text-ink">{SARAH.name}, here&apos;s your plan.</div>
          <div className="mt-3 grid gap-2">
            {SUGGESTED.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-cream/60 p-2.5">
                <Pack product={p} className="h-14 w-12" />
                <div className="min-w-0">
                  <div className="font-display text-[1rem] leading-tight text-ink">{p.name}</div>
                  <p className="mt-1 text-[0.78rem] leading-snug text-ink-soft">
                    <span className="font-semibold text-clay">Because </span>
                    {p.because}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "You close on WhatsApp",
      body: "The customer can message you with their answers already included, so you know what they're looking for before the conversation starts. You continue the sale the way you already do.",
      visual: (
        <div className="-m-4 flex h-[calc(100%+2rem)] flex-col justify-end gap-2 bg-wa-bg p-3">
          <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-none bg-wa-bubble px-3 py-2 text-[0.78rem] leading-[1.45] text-[#111b21] shadow-sm">
            <WaText text={OPENING} />
          </div>
          <div className="max-w-[88%] rounded-xl rounded-tl-none bg-white px-3 py-2 text-[0.78rem] leading-[1.45] text-[#111b21] shadow-sm">
            Hi {SARAH.name}! The coffee is {kes(coffee.price)} and {joints.short} is {kes(joints.price)}. I can deliver both
            tomorrow. Shall I?
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <h2 className="display-lg max-w-[20ch] text-ink">How Suppli Afya Works</h2>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.06 * i} className="max-w-[30rem]">
              <div aria-hidden className={clsx("h-[16rem] overflow-hidden rounded-[1.5rem] p-4 shadow-card ring-1 ring-ink/10", s.box ?? "bg-paper")}>
                {s.visual}
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-[1.6rem] leading-none text-clay">{i + 1}</span>
                <h3 className="font-display text-[1.55rem] leading-tight text-ink">{s.title}</h3>
              </div>
              <p className="mt-2 max-w-[24rem] text-[1rem] leading-relaxed text-ink-soft">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1} className="mt-14 border-t border-ink/10 pt-6">
          <p className="max-w-[46rem] text-[1rem] leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">In the background, your workspace keeps the record.</span> Every enquiry is
            saved with what the customer was looking for, making it easier to follow up and know who may be ready to reorder.
          </p>
        </Reveal>

      </div>
    </section>
  );
}
