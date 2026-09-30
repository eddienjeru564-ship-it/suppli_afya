import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import { QrCard } from "@/components/brand/QrCard";
import { Reveal } from "@/components/ui/Reveal";
import { qrSvg } from "@/lib/qr";
import { KATE } from "./story";

const ONLINE = ["WhatsApp status", "Instagram bio", "TikTok bio", "Facebook page", "Forwarded by a customer"];
const OFFLINE = ["Business cards", "Every order you deliver", "Your shop counter", "Posters and flyers", "Chama and church meetings"];

/** From paper to a conversation: the card is the bridge from an offline meeting to Kate's WhatsApp. */
const BRIDGE = ["A card", "A phone camera", `${KATE.first}'s page`, "A few questions", "Suggestions", `WhatsApp ${KATE.first}`];

export async function Share() {
  const d = DEMO_DISTRIBUTOR;
  const url = `${site.url}/d/${d.slug}`;
  const svg = await qrSvg(url);

  return (
    <section id="share" className="overflow-hidden bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div>
            <Reveal>
              <div className="eyebrow">Your link and QR code</div>
              <h2 className="display-lg mt-5 max-w-[16ch] text-ink">Put your page wherever people already find you</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede mt-6 max-w-[34rem]">
                Every conversation can end with “scan this” or “here&apos;s my link”. Whoever uses it lands on your page, and
                only yours, and anything they send comes to you.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Reveal delay={0.1}>
                <h3 className="text-[0.95rem] font-semibold text-ink">Your link, online</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ONLINE.map((c) => (
                    <li key={c} className="rounded-full border border-ink/15 bg-cream px-3 py-1.5 text-[0.85rem] text-ink-soft">
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.15}>
                <h3 className="text-[0.95rem] font-semibold text-ink">Your QR code, in person</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {OFFLINE.map((c) => (
                    <li key={c} className="rounded-full border border-ink/15 bg-cream px-3 py-1.5 text-[0.85rem] text-ink-soft">
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.1}>
            <QrCard name={d.name} tagline={KATE.title} url={url} displayUrl={KATE.link} svg={svg} />
            <p className="mt-10 text-center text-[0.85rem] text-ink-mute">
              {KATE.first}&apos;s card. Yours has your name and your own link: print ten to a page from your workspace, or
              download the QR code.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-20">
          <h3 className="text-center text-[0.95rem] font-semibold text-ink">From a card in someone&apos;s hand to a chat with you</h3>
          <ol className="mx-auto mt-6 flex max-w-[60rem] flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {BRIDGE.map((b, i) => (
              <li key={b} className="flex items-center gap-2">
                <span
                  className={
                    i === BRIDGE.length - 1
                      ? "rounded-full bg-wa px-3.5 py-2 text-[0.9rem] font-semibold text-[#06331f]"
                      : "rounded-full bg-cream px-3.5 py-2 text-[0.9rem] text-ink ring-1 ring-ink/10"
                  }
                >
                  {b}
                </span>
                {i < BRIDGE.length - 1 && (
                  <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 text-ink-mute">
                    <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
