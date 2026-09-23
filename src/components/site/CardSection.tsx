import QRCode from "qrcode";
import { DEMO_DISTRIBUTOR } from "@/config/distributors";
import { site } from "@/config/site";
import { LogoMark } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";

async function qrSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#11231a", light: "#00000000" },
  });
}

export async function CardSection() {
  const d = DEMO_DISTRIBUTOR;
  const link = `${site.url}/d/${d.slug}`;
  const svg = await qrSvg(link);

  return (
    <section id="card" className="overflow-hidden py-24 sm:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto aspect-[1.6/1] w-[86%] max-w-[30rem] sm:w-full">
            {/* back card */}
            <div className="absolute inset-0 translate-x-3 translate-y-4 rotate-[5deg] sm:translate-x-6 sm:translate-y-6 rounded-[1.4rem] bg-forest shadow-float">
              <div className="flex h-full flex-col justify-between p-6 text-cream sm:p-8">
                <LogoMark tone="cream" className="h-8 w-8" />
                <div className="font-display text-[1.35rem] leading-tight italic text-cream/90">
                  Afya yako, <br /> mpango wako.
                </div>
              </div>
            </div>
            {/* front card */}
            <div className="absolute inset-0 -rotate-[3deg] rounded-[1.4rem] border border-ink/10 bg-paper shadow-float">
              <div className="grid h-full grid-cols-[1fr_auto] gap-4 p-5 sm:gap-6 sm:p-7">
                <div className="flex flex-col">
                  <div className="font-display text-[1.3rem] leading-tight text-ink sm:text-[1.5rem]">{d.name}</div>
                  <div className="text-[0.72rem] text-ink-mute sm:text-[0.8rem]">BF Suma distributor · {d.area}</div>
                  <div className="mt-auto font-display text-[1rem] leading-snug text-ink sm:text-[1.2rem]">
                    Not sure what you need? Take a three-minute health check.
                  </div>
                  <div className="mt-2 font-mono text-[0.66rem] text-forest sm:text-[0.75rem]">
                    {site.displayDomain}/d/{d.slug}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="h-24 w-24 rounded-lg bg-white p-2 sm:h-32 sm:w-32 [&>svg]:h-full [&>svg]:w-full"
                    aria-label={`QR code linking to ${link}`}
                    role="img"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                  <div className="mt-2 text-[0.62rem] font-semibold text-ink-mute sm:text-[0.7rem]">Scan to start</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <div className="eyebrow">Your link and QR card</div>
            <h2 className="display-lg mt-5 max-w-[16ch] text-ink">Your name on the card, your WhatsApp at the end of it</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lede mt-7 max-w-[34rem]">
              Every distributor gets a personal link and a printable QR card. Put the link on your WhatsApp status, your
              Facebook page or your TikTok bio. Leave cards on your shop counter, hand them out at chama meetings and
              events, or put one in every order you deliver. Whoever does the health check through your link comes to
              you, and only to you.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
