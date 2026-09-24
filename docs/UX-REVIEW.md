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

## Second pass

A fresh review of every screen, with orders now arriving from distributors' own pages.

### Bugs

| Problem | Why it matters | Change |
|---|---|---|
| With "reduce motion" on, the homepage's first screen rendered differently on the server and in the browser, so React threw it away and rebuilt it | A flash and a console error for exactly the people who asked for a calmer page. Motion's reduced-motion hook knows the answer in the browser but not on the server | `@/components/ui/useReducedMotion` reads "no" on the server and during hydration, then the real preference. Motion's own hook isn't used anywhere |
| The homepage headline arrived in the HTML at zero opacity and only appeared once the JavaScript ran | On a slow connection the first screen was blank for seconds | The hero and the section reveals are CSS (`.rise`, `.rise-word`, `.reveal` in `globals.css`): readable the moment the HTML lands, and still with reduced motion. `e2e/site.spec.ts` loads the page with JavaScript off and checks every word is visible, with space between them |
| "M-Pesa" broke across lines at its hyphen ("Approve the M-" / "Pesa prompt") | Reads like a typo, in the payment step of all places | `keepTogether()` and `<MPesa />` keep it on one line wherever it's in running text |
| The test payment screen said "this is where the customer enters their M-Pesa PIN" | The person paying is the distributor | "where you'd enter your M-Pesa PIN" |

### Orders from a distributor's page

| Problem | Why it matters | Change |
|---|---|---|
| On Today, "Getting started" sat above the list, pushing a waiting order below the fold | Someone waiting on you is the one obvious next step | When anyone needs you, Today comes first and the checklist follows; on a quiet day the checklist leads |
| The order page offered "Send a payment reminder" for an order nobody had confirmed | Chasing payment before confirming stock, delivery and the total is rude | Page orders open with "Confirm it with Wanjiru": the confirmation message, "Send on WhatsApp" and "I've confirmed it". Payment reminders appear after that. Either action also clears the item from Today |
| "Probio3, KES 7,800. Deliver to Within Nairobi, Kilimani…" | The count was missing and the delivery zone ran into the directions | "2 × Probio3, KES 7,800. Delivery: Within Nairobi · Kilimani, near Yaya Centre." Area and directions are stored separately |
| The ready-to-send message was cut off mid-sentence in a three-line box | You'd send a message you couldn't fully read | The box grows to fit the message where the browser can |
| A bare "Open" link beside the task buttons, out of line with them | Unclear where it goes | "See the order", "See their answers" or "See their record", aligned with the buttons |

### Details

| Problem | Change |
|---|---|
| Check marks were a font glyph in some places and an icon in others | The same drawn check everywhere |
| On the set-up summary, "Copy" sat oddly indented after the link | The link and "Copy" share a line that wraps cleanly |
| A long email could run off the payment screen on a small phone | It wraps |
