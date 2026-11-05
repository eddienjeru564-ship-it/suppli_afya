import { Check } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { BusinessCard } from "./BusinessCard";

/** What a distributor wants to know before trusting anyone with their customers. Each is true today. */
const YOURS = [
  { title: "Your customers stay yours.", body: "We never sell their details or contact them ourselves." },
  { title: "Independent of BF Suma.", body: "Your upline, stock and distributor account stay as they are." },
  { title: "No contract.", body: "After setup, pay monthly by M-Pesa or card, and stop when you like." },
];

/**
 * Whose business this is. The page is how customers find the distributor, not the product itself,
 * so it comes after the story: their name on it, their link and QR card, their WhatsApp, their
 * customers. The reassurances live here because they're the same point.
 */
export function YourPage() {
  return (
    <section id="your-page" className="py-16 sm:py-24 lg:py-28">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        {/* Text second on large screens, so it doesn't mirror the follow-up section just above. */}
        <Reveal className="lg:order-2">
          <h2 className="display-lg max-w-[14ch] text-ink">Your Name. Your Page. Your Customers.</h2>
          <p className="lede mt-6 max-w-[32rem]">
            Customers find you through a page with your name on it. Share the link on your WhatsApp status, in your bio or on
            a printed QR card. Every conversation happens on your own WhatsApp.
          </p>
          <ul className="mt-8 grid max-w-[32rem] gap-3.5">
            {YOURS.map((y) => (
              <li key={y.title} className="flex items-start gap-3 text-[0.98rem] leading-snug">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                <span>
                  <span className="font-semibold text-ink">{y.title}</span> <span className="text-ink-soft">{y.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="lg:order-1">
          <div className="grid place-items-center rounded-[2rem] bg-sand/50 px-5 py-10 ring-1 ring-ink/5 sm:px-10 sm:py-16">
            <BusinessCard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
