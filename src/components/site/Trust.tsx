import { Reveal } from "@/components/ui/Reveal";

const CHECKS = [
  { when: "Takes blood thinners", then: "Leaves out CereBrain and MicrO2 Cycle, and explains why." },
  { when: "Allergic to shellfish", then: "Leaves out the glucosamine joint products and Ez-Xlim." },
  { when: "Avoids pork", then: "Leaves out GluzoJoint-F, whose chondroitin comes from pork." },
  { when: "On diabetes medicine", then: "Warns that blood sugar products can add to the medicine's effect." },
  { when: "Pregnant or breastfeeding", then: "Holds back the product plan and suggests speaking to her clinic first." },
  { when: "Over 45 with prostate symptoms", then: "Suggests asking a doctor about a PSA test." },
];

export function Trust() {
  return (
    <section id="trust" className="bg-paper py-24 sm:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <div className="eyebrow">Why customers trust it</div>
            <h2 className="display-lg mt-5 max-w-[15ch] text-ink">
              It knows when to say <span className="italic text-forest">“check with your doctor first”</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="lede mt-7 grid max-w-[36rem] gap-5">
              <p>
                Customers can tell when they&apos;re being sold to, so the health check is built to be useful to them
                first. Before it suggests anything, it asks about pregnancy, medicine, allergies and existing
                conditions, and it leaves out products that don&apos;t suit that person. It explains what each product is
                for in plain words, is honest about how long things take, and never tells anyone a supplement will cure
                a disease.
              </p>
              <p className="text-ink">
                That protects your customer, and it protects your name. The customer who trusted your advice is the one
                who reorders, and the one who sends her sister to you.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] border border-ink/10 bg-cream p-6 sm:p-8">
            <div className="text-[0.85rem] font-semibold text-ink-soft">A few of the checks it runs</div>
            <ul className="mt-5 divide-y divide-ink/10">
              {CHECKS.map((c) => (
                <li key={c.when} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-5">
                  <span className="text-[0.95rem] font-semibold text-clay">{c.when}</span>
                  <span className="text-[0.95rem] leading-relaxed text-ink">{c.then}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
