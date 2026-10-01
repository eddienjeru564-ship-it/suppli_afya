import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import { QrCard } from "@/components/brand/QrCard";
import { Reveal } from "@/components/ui/Reveal";
import { qrSvg } from "@/lib/qr";
import { KATE } from "./story";

const OWNED = [
  { title: "Your name", body: "On your page, your QR cards and every message. Suppli Afya stays in the small print." },
  { title: "Your WhatsApp", body: "Customers message your own number, and you reply in your own words. We're never in the chat." },
  { title: "Your prices", body: "You quote, deliver and get paid the way you already do. Suppli Afya never holds your money." },
  {
    title: "Your customers",
    body: "Their records belong to you. We don't sell them, share them with other distributors, or contact your customers ourselves.",
  },
];

/** What the assessment does when an answer calls for care (src/engine/safety.ts). */
const CARE = [
  { when: "Pregnant or breastfeeding", then: "No product plan. It suggests speaking to her clinic first." },
  { when: "Takes blood thinners", then: "Leaves out CereBrain and MicrO2 Cycle, and says why." },
  { when: "Avoids pork", then: "Leaves out GluzoJoint-F, whose chondroitin comes from pork." },
  { when: "On diabetes medicine", then: "Warns that blood sugar products can add to the medicine's effect." },
];

export async function Yours() {
  const d = DEMO_DISTRIBUTOR;
  const svg = await qrSvg(`${site.url}/d/${d.slug}`);

  return (
    <section id="distributors" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div>
            <Reveal>
              <div className="eyebrow">Built around the distributor</div>
              <h2 className="display-lg mt-5 max-w-[14ch] text-ink">Your name, your WhatsApp, your customers</h2>
              <p className="lede mt-6 max-w-[34rem]">
                Suppli Afya gives you the page, the assessment and the workspace. Customers still buy from you, the person
                they trust.
              </p>
            </Reveal>
            <dl className="mt-10 max-w-[36rem] divide-y divide-ink/10 border-y border-ink/10">
              {OWNED.map((o, n) => (
                <Reveal key={o.title} delay={0.04 * n} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="font-display text-[1.25rem] leading-tight text-ink">{o.title}</dt>
                  <dd className="text-[0.98rem] leading-relaxed text-ink-soft">{o.body}</dd>
                </Reveal>
              ))}
            </dl>
          </div>

          <Reveal delay={0.1}>
            <QrCard name={d.name} tagline={KATE.title} url={`${site.url}/d/${d.slug}`} displayUrl={KATE.link} svg={svg} />
            <p className="mx-auto mt-12 max-w-[24rem] text-center text-[0.9rem] leading-relaxed text-ink-mute">
              {KATE.first}&apos;s card. Yours has your name and your own link: print a sheet of them from your workspace,
              or download the QR code.
            </p>
          </Reveal>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-10 border-t border-ink/10 pt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <h3 className="display-md max-w-[16ch] text-ink">Careful, because it carries your name</h3>
            <p className="mt-5 max-w-[32rem] text-[1.02rem] leading-relaxed text-ink-soft">
              The assessment helps people find where to start. It doesn&apos;t diagnose anything, and it never says a product
              treats or cures a disease. It asks about pregnancy, medicine, allergies and conditions before suggesting
              anything, and when something needs a doctor or pharmacist first, it says so.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              {CARE.map((c) => (
                <div key={c.when} className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <dt className="text-[0.95rem] font-semibold text-clay">{c.when}</dt>
                  <dd className="text-[0.95rem] leading-relaxed text-ink">{c.then}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
