import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import { QrCard } from "@/components/brand/QrCard";
import { Reveal } from "@/components/ui/Reveal";
import { qrSvg } from "@/lib/qr";

const STEPS = [
  {
    title: "Choose a plan and pay",
    body: "By M-Pesa or card. It takes about two minutes, and your account is saved even if a payment doesn't go through the first time.",
  },
  {
    title: "Tell us about your business",
    body: "Five short questions: who you are, where you sell, how customers reach you and what you want to improve. Your workspace is set up around the answers.",
  },
  {
    title: "Share your link and QR card",
    body: "Put the link on your WhatsApp status, Facebook page or TikTok bio. Print the card for your shop counter, chama meetings, or every order you deliver. Whoever uses it comes to you, and only to you.",
  },
  {
    title: "Work from your portal",
    body: "Health checks arrive as prospects. Record orders and payments as they happen, and each morning the portal shows who needs a message and why.",
  },
];

export async function Setup() {
  const d = DEMO_DISTRIBUTOR;
  const url = `${site.url}/d/${d.slug}`;
  const svg = await qrSvg(url);

  return (
    <section id="setup" className="overflow-hidden py-24 sm:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <div className="eyebrow">How setup works</div>
            <h2 className="display-lg mt-5 max-w-[16ch] text-ink">From payment to your first prospect in an afternoon</h2>
          </Reveal>
          <ol className="mt-10 grid gap-7">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.06 * i} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 font-display text-lg text-ink">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[1.4rem] leading-tight text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[1rem] leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal delay={0.1}>
          <QrCard
            name={d.name}
            tagline={`BF Suma distributor · ${d.area}`}
            url={url}
            displayUrl={`${site.displayDomain}/d/${d.slug}`}
            svg={svg}
          />
          <p className="mt-10 text-center text-[0.85rem] text-ink-mute">
            Your card, with your name and your own link. Download it from your portal.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
