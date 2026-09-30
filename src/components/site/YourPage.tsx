import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { MockPhone, PageScreen } from "./Screens";
import { KATE, SUGGESTED } from "./story";

const PARTS = [
  {
    title: "Your own link",
    body: `${KATE.link}. The same address your QR code opens, so every card, post and bio leads here.`,
  },
  {
    title: "Your name and what you do",
    body: "Right at the top, on every screen. Customers know whose page they're on, and who they'll be talking to.",
  },
  {
    title: "One clear place to start",
    body: "Instead of a wall of products, a short assessment: what they're looking for, their routine, anything to be careful with.",
  },
  {
    title: "A direct line to you",
    body: "Someone who already knows what they want can message you straight away. Everyone else reaches you with their answers in hand.",
  },
];

export function YourPage() {
  return (
    <section id="page" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Phones have just seen this page in the hero, so the phone here is for larger screens. */}
          <Reveal className="hidden lg:block">
            <div aria-hidden>
              <MockPhone>
                <PageScreen markers />
              </MockPhone>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="eyebrow">Your page</div>
              <h2 className="display-lg mt-5 max-w-[15ch] text-ink">A place of your own where customers can start</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lede mt-6 max-w-[34rem]">
                Every distributor gets a page with their name on it, at their own link. It&apos;s the first thing a customer
                sees when they scan your card or tap your link, and it only ever leads back to you.
              </p>
            </Reveal>
            <ol className="mt-10 grid gap-6">
              {PARTS.map((p, i) => (
                <Reveal as="li" key={p.title} delay={0.05 * i} className="grid grid-cols-[2rem_1fr] gap-4">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-clay font-display text-[0.9rem] text-cream">{i + 1}</span>
                  <div>
                    <h3 className="text-[1.05rem] font-semibold text-ink">{p.title}</h3>
                    <p className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* Why this isn't an online shop. */}
        <div className="mt-24 sm:mt-32">
          <Reveal>
            <h3 className="display-md max-w-[24ch] text-ink">Not another online shop</h3>
            <p className="lede mt-4 max-w-[40rem]">
              Most people who ask about a supplement don&apos;t know which one they need. A shop expects them to. Your page
              helps them work it out, then hands them to you.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal className="rounded-[1.75rem] border border-ink/10 bg-cream p-6 sm:p-8">
              <div className="text-[0.85rem] font-semibold text-ink-mute">A normal online store</div>
              <p className="mt-3 font-display text-[1.6rem] leading-snug text-ink-soft">“Here are 40 products. Pick one.”</p>
              <div aria-hidden className="mt-6 grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg bg-ink/[0.06]" />
                ))}
              </div>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-ink-soft">
                The customer has to know what they need, compare labels on their own and trust a checkout. Most close the
                tab, and nobody knows they were ever there.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="rounded-[1.75rem] bg-forest p-6 text-cream shadow-float sm:p-8">
              <div className="text-[0.85rem] font-semibold text-sage">Your page</div>
              <p className="mt-3 font-display text-[1.6rem] leading-snug">
                “Tell me what you&apos;re looking for, and I&apos;ll help you find where to start.”
              </p>
              <div aria-hidden className="mt-6 grid gap-2">
                {SUGGESTED.map((p) => (
                  <div key={p.name} className="flex items-center gap-3 rounded-xl bg-cream/10 px-3 py-2.5">
                    <span className="h-7 w-5 shrink-0 rounded" style={{ background: p.tone }} />
                    <span className="min-w-0 flex-1 truncate text-[0.9rem]">
                      <span className="sm:hidden">{p.short}</span>
                      <span className="hidden sm:inline">{p.name}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-cream/15 px-2 py-0.5 text-[0.7rem]">{p.goal}</span>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 rounded-xl bg-wa py-2.5 text-[0.9rem] font-semibold text-[#06331f]">
                  <WhatsAppIcon className="h-4 w-4" /> Talk it through with {KATE.first}
                </div>
              </div>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-cream/75">
                The customer gets guidance first, a short list with reasons, and a person to ask. You get a conversation
                with someone who already knows what they want.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-[46rem] text-[1rem] leading-relaxed text-ink-soft">
              Guidance like this usually belongs to a brand&apos;s own shop, and so does the customer. On Suppli Afya the
              guidance happens on your page, and the customer ends up in your WhatsApp and your customer list, not in
              someone else&apos;s checkout.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
