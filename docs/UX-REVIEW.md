# UX review

A screen-by-screen review of the whole journey on a phone (390px) and desktop (1440px), what
wasn't working, and what we changed. Keep this as the record of why screens look the way they do.

## Principles we design by

1. **One obvious next step per screen.** Secondary options exist but never compete with it.
2. **Momentum over completeness.** Ask only for what the next screen needs. Never ask twice.
3. **Show progress as one journey.** Account → Payment → Set up is one path with one stepper.
4. **Remove doubt at the moment it appears.** Price, "nothing renews automatically", "your account
   is saved", said next to the button that triggers the worry, not in a FAQ.
5. **Empty is an invitation, not a report.** New accounts see what to do next, not rows of zeros.
6. **Phones first.** Distributors run their business from a phone, one thumb, often on the move.

## What we found, and what changed

### Homepage

| Problem | Why it matters | Change |
|---|---|---|
| About 22 phone screens long; pricing arrives after 14 | Long pages lose people before the offer | Removed "The same week, two ways" (it retold "Where the sales actually go") |
| Hero paragraph is six lines on a phone | The hero should be read in one breath | Cut to two sentences |
| Hero secondary button "See how it works" | Price was the question people had; the brief asked for visible pricing | Secondary button is now "See plans", with "From KES 1,500 a month" beneath |
| Sticky phone bar always said "Try it", even after the demo | Asking again for something already done feels like nagging | The bar offers the demo until it's been seen, then the plans |
| On phones, Starter is the first plan you see | The recommended plan should be the first one read | Growth comes first on phones; desktop keeps Starter, Growth, Pro left to right |

### Account, payment, set up

| Problem | Why it matters | Change |
|---|---|---|
| Two progress systems: "Step 2 of 3", then "1 of 4" | Feels like a second, longer process has started | Set up is step 3 of the same stepper, with its own small progress inside it |
| "Payment confirmed" still said "Step 2 of 3" | The payoff moment looked unfinished | It shows the payment step as done |
| "Let's get Suppli Afya set up" on two screens in a row | A click that does nothing costs trust | The confirmation screen is the welcome. It goes straight to the first question |
| Password typed blind on a phone | Mistyped passwords mean failed log-ins later | Show/hide toggle |
| "Signed in as …" competes with the price on the payment screen | The price and the button are what matter | Moved under the button, quieter |
| On the business step, the Continue button's fade started too high over the last options | Options looked cut off rather than scrollable | A shorter, firmer fade behind the button |

### Portal

| Problem | Why it matters | Change |
|---|---|---|
| The phone header's settings icon read as a sun (light/dark switch) | Nobody finds Settings | Your initial in a circle, which opens Settings |
| New accounts see "This month" as a row of zeros | Zeros read as failure on day one | "This month" appears once there's something to count |
| "You're up to date" on an empty account | Not true in any useful sense | New accounts are pointed at the first step instead |
| Getting started began at "0 of 3" | Starting from zero makes a list feel long | "Set up your workspace" is already ticked, so it starts at 1 of 4 |
| A new customer's page shows three empty stat boxes | Noise where the next action should be | With no orders yet, it shows one clear "Record their first order" |
| "Already paid" was a small checkbox on the order form | Easy to skip, so paid orders were saved as unpaid and chased by mistake | A clear "Has it been paid? Not yet / Paid" choice before saving |

## The installed app

| Question | What we chose | Why |
|---|---|---|
| Where to offer installing | A small card on Today (phones only, "Not now" hides it for three weeks) and a permanent section in Settings | Today is where the daily habit forms; Settings is where people look later. No pop-ups on arrival |
| Android and desktop | "Install" opens the browser's own dialog | It's the real, trusted flow; our card only decides when to offer it |
| iPhone | Three illustrated steps (Share, Add to Home Screen, Add), plus "log in once" | Apple has no install button. Pretending otherwise breaks trust |
| Inside Instagram, Facebook or TikTok | "Open in Safari/Chrome first", with a copy-link button | In-app browsers can't install; many links arrive through them |
| Desktop | Install button when the browser supports it, and a QR code to open the portal on your phone | The phone is where the app matters |
| Opening the app | Straight into Today; the launch screen is the icon on cream, matching the first frame | No flash of white, no marketing site |
| Staying signed in | Sessions renew with use | Logging in again on a phone is the fastest way to lose a daily user |
| Poor signal | Every tap shows the page's shape at once; a bar says when you're offline or looking at a saved copy; saves wait and retry | People sell on the move. The app should never look broken because the network is |
| New versions | "A new version is ready · Update", never a surprise reload | Nobody loses a half-typed order |
| Notifications | One optional morning reminder, offered inside the installed app, permission asked only on tap | One useful nudge beats many ignored ones |
| Tab bar | Four tabs, 60px tall, a pill that slides to the current tab, a pulse while the next page loads | Thumb reach, and clear feedback that a tap registered |

## The customer shop (`/d/<slug>`)

| Question | What we chose | Why |
|---|---|---|
| What the page is | The distributor's own shop, with Suppli Afya only in the footer | Customers buy from a person they can ask. The platform should be credible, not loud |
| The hero | "Supplements that suit you, from someone you can ask", two paths (Help me choose · Browse), WhatsApp one line below, the three most asked-for products on one shelf, and the distributor's own note | Says who, what and how in one screen, and gives the undecided and the decided their own first step |
| Finding products | "What would you like help with?" by need, then the catalogue with need filters that stay pinned while you scroll, and search | People shop by problem, not by BF Suma's range names |
| Product presentation | Every product on the same 4:5 stage and floor, official photos when supplied, otherwise one quiet unlabelled illustration per format | A catalogue that looks like one set. No fake packaging |
| Product pages | What it is, what people take it for, what to expect, key ingredients, "Before you take it" read from the same safety traits as the check, and "Not sure? Take the check / Ask Kate" | Enough to decide, honest about limits, never a health claim |
| Recommendations | The check runs inside the shop; the plan explains why each product is there, says it comes from your answers and isn't a diagnosis, shows prices, and "Order this plan" puts it in the basket | The engine's reasoning, carried straight into buying |
| Ordering | Basket sheet, then one page: name, phone, deliver or collect, M-Pesa or cash, a note. Nothing is charged online. The confirmation says exactly what happens next and how to pay | First-time customers need to know who confirms, when, and how money moves, before they commit |
| WhatsApp | In the header, the phone action bar, on every product ("Ask Kate about this"), the basket ("send this list"), the results and the confirmation, each with a message already written | Help at the moment of doubt, with the context already in the message |
| Phones | A bottom bar that becomes the basket once something is in it; product pages keep price and Add in reach; 2-column catalogue; sheets instead of new pages | One thumb, weak signal, no hunting |
| Trust | Who they're buying from (name, area, reply hours, languages), how ordering and payment work, straight answers on genuineness, medicine and cancelling | Reassurance where the question arises, not a wall of badges |
