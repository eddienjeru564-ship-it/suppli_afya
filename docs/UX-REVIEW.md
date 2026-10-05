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

## Third pass

Every page at 360px and 1440px, with an accessibility checker (axe) on each screen.

| Problem | Why it matters | Change |
|---|---|---|
| On a 360px phone the homepage was 383px wide: the demo Today list stretched its column, cutting off "Your portal" text at the right | The page wobbles sideways and the text reads as broken, on the phones most distributors use | That grid is `grid-cols-1` on phones. `e2e/site.spec.ts` checks the public pages at 360px, as `pwa.spec.ts` already did for the portal |
| Messages to "Mama Njeri" opened "Hi Mama," | Wrong, and it's the distributor's name on the message. The homepage demo already wrote "Habari Mama Njeri!" | `greetingName()` (`src/lib/names.ts`) keeps a form of address with the name after it: Mama Njeri, Mzee Kamau, Dr. Achieng. Used for customers, prospects and distributors alike |
| "M-Pesa and cash payments recorded against orders" split into two columns under "Every plan includes", with a shrunken tick | Looked broken right beside the prices | `keepTogether()` returns one inline piece, so a flex row keeps the sentence together; ticks don't shrink and sit on the first line |
| The desktop sidebar's Settings icon was a sun | The same "is this a light/dark switch?" confusion the phone header had | A gear |
| The demo Today list said "Tuesday 14 October" | 14 October 2026 is a Wednesday. Small, but the kind of thing a careful reader notices | Tuesday 13 October |

### Accessibility

| Problem | Change |
|---|---|
| The health check pages (`/check`, `/d/<slug>`) and the QR card sheet had no main landmark or page heading | A `<main>` and a heading for screen readers ("Health check with Grace Wambui"); each step keeps its question as the visible heading |
| The "Unpaid" tag (clay on pale clay) was 4.0:1 | `clay` is a shade deeper (#8a4a27), 4.8:1 on its tag and 5.9:1 on cream |
| The customer and payment-method dropdowns, and the M-Pesa code boxes, had no names | Labelled |
| The homepage's steps scroll sideways on phones but couldn't be reached by keyboard; its large step numbers were read out | The row is focusable and named; the numbers are decorative (the list is already numbered) |
| Two unnamed navigation landmarks on the homepage | "Main" and "Footer" |

### Leads from the health check

`/api/leads` is public and files prospects into a distributor's workspace. It now keeps only answers to questions
the check asks (not whatever a request sends), refuses oversized requests, ignores an age that isn't a real age,
and takes at most 300 new prospects per workspace an hour, far above a busy chama meeting and far below a script
filling someone's Today list. `src/server/leads.test.ts` covers each.

## Fourth pass: the distributor's page comes first

The homepage led with the workspace (Today list, reminders, payments), so it read like a CRM. Suppli
Afya's front door is the distributor's own page: a customer scans a card or taps a link, answers a
short assessment, sees which products fit, and talks to the distributor on WhatsApp. The workspace
keeps that customer afterwards. The homepage now tells that story in order, with one example all the
way through: Kate Cromuel's page, and Sarah, who scans Kate's card and ends up reordering.

| Section | What it's for |
|---|---|
| Hero | The ten-second test: for supplement distributors, your own page, customers find relevant products, they talk to you, you follow up. The phone plays Kate's page → a question → Sarah's plan → WhatsApp, while the enquiry lands in Kate's workspace |
| How it usually goes | Interest turns up everywhere, and every person needs the same walk-through in a chat. The loss looks like a slow month |
| How it works | Thirteen steps from Kate sharing her page to Sarah ordering again, grouped as attract, qualify and recommend, convert, follow up and reorder. Desktop keeps a phone beside the steps that shows what Sarah or Kate sees at each one; phones get one screen per group |
| Your page | The four parts of the page, and why it isn't an online shop ("Here are 40 products" against "Tell me what you're looking for") |
| Try it | The real assessment on Kate's example page, with what reaches Kate beside it |
| Responsible by design | The safety checks, and why they protect the distributor's name |
| Your workspace | Sarah's record: what she was looking for, what was suggested, what she bought, and when to check in |
| Your link and QR code | Where to share the page online and in person, and the path from a card to a WhatsApp chat |
| After the first sale | The Today list: reorders, payments and customers who have gone quiet |
| Pricing, Questions | What it costs, and the questions distributors ask. The earnings calculator ("Your numbers") is gone: after the first sale, the page goes straight to pricing |

| Problem | Change |
|---|---|
| Customers were told to take a "health check", which sounds clinical and invites diagnosis | "The assessment" everywhere people read it, including the WhatsApp messages and the portal. The engine and routes keep their names |
| The example distributor was invented | Kate Cromuel, a real distributor, whose storefront is the reference. The demo copy has no phone number, so no chat opens to her. **Confirm with Kate before launch that her name and "Wellness Consultant" can appear on the homepage** |
| A customer who already knew what they wanted still had to start the assessment | A real distributor's page offers "Or message {name} directly" on the first screen |
| The first version of this page was 42 phone screens long | Phones get one screen per group of steps instead of one per step, the "Your page" phone is desktop-only (phones have just seen it in the hero), and the shop comparison is shorter: about 34 screens |
| Numbered pointers on the page mock sat over the monogram and the Start button | They line up down the right edge of the screen |
| Chat timestamps on green bubbles and the inactive stage pills were under 4.5:1 | Darker grey (#54656f) and `ink-soft` |

## Fifth pass: show the product, not a description of it

The fourth pass got the story right; this one replaces explanation with the product itself. Every
section now shows a real surface (Kate's page, the assessment, the plan, the WhatsApp message, the
workspace), and the words in those surfaces are what the engine and the Today list actually write.

| Section | What changed |
|---|---|
| Hero | Copy answers what it is, who it's for and what the customer does, in two sentences. A step rail under the phone names each scene (Kate's page, Questions, Suggestions, WhatsApp); the enquiry card shows the suggested products. Primary call to action is "See it in action" |
| How it usually goes | Shorter, built around the real question ("Which one should I take?"), ending on the slow month |
| Your own customer page | Type your name and the page in the phone becomes yours: your initials, your name, your link. Nothing is saved |
| How it works | The 13-step scroll became an interactive tour in seven steps, one per verb of the loop: attract, understand, recommend, connect, sell, follow up, reorder. Both phones side by side on large screens (one at a time, with a switch, on phones); a WhatsApp message visibly crosses between them. Plays while on screen, stops when you choose a step, and has a pause button |
| The WhatsApp handoff | New. The exact message the engine writes for Sarah, with each part labelled, then Kate's reply. The finished chat is in the HTML; with scripts it replays once when it scrolls into view |
| After the first sale | The workspace and follow-up sections became one: Kate's Today list with one person of each kind (new, unpaid, check in, reorder due, gone quiet), the ready message and the history for whoever you tap |
| Not another online shop | Its own section: a shelf of look-alike packs (browse, choose, checkout) against Kate's page (tell us, get guidance, talk to Kate) |
| Built around the distributor | Name, WhatsApp, prices and customers stay yours, with the QR card; the safety section is now a short "careful, because it carries your name" with four real examples |
| Pricing | What every plan includes is listed once; each plan card shows only what it adds |
| Final call to action | "See what your customers would see", opening Kate's page |

| Problem | Change |
|---|---|
| Mock product cards were coloured rectangles, and their reasons didn't match what the engine says | Neutral pack renders (also on the real results screen), and the engine's own reasons; `story.test.ts` keeps them in step |
| Headlines in Newsreader at 400 looked thin at display sizes | Display styles at 460 (the font is variable, so nothing extra loads) |
| The FAQ said "your customer list goes with you", but there's no export yet | Removed until there is one |
| 32 phone screens long | About 28, with more shown and less explained |
| The dimmed phone in the tour faded its own text below 4.5:1 | It sits behind a scrim instead; the active step label uses a lighter ochre on the dark panel |

## Sixth pass: one decision, not a tour

The fifth pass showed everything the product does, and it was too much at once for a first visit:
twelve sections, a seven-step tour, and the workspace explained twice. A distributor deciding
whether to try it needs the simplest version of the offer first, and the depth only when they look
for it. The page is now seven sections, each answering the next question a visitor has:

| Section | The visitor's question |
|---|---|
| Hero | What is this, and is it for me? Headline, one sentence, "See it in action" and "Claim your page", and one line: from KES 1,500 a month, no contract, pay by M-Pesa |
| How it usually goes | Do they understand my problem? Four short lines, beside the WhatsApp chat everyone recognises |
| How it works | How does it work? Three steps, each with its real screen: share your link, they get their own plan, you close on WhatsApp. The workspace is one sentence and a link |
| See it in action | Does it actually work? "Don't take our word for it": the real assessment, then four things that are true today (independent of BF Suma, your customers stay yours, careful with health, no contract). Real distributor quotes appear here once there are any (`src/config/testimonials.ts`) |
| After the sale | What else do I get? Kate's Today list, one person open with the message ready |
| Questions | What's stopping me? Seven questions |
| Pricing | What does it cost? One card: KES 1,500 a month, what you get, "Claim your page now". Growth and Pro are a line underneath, and checkout lets anyone switch |

Removed: the seven-step tour, the WhatsApp handoff section, "put your name on it", "not another
online shop" and "built around the distributor". Their substance lives on in the three steps, the
trust facts and the FAQ. The phone page went from 28 screens to about 15, desktop from 16 to 8.

No testimonial was written for this pass. A made-up quote would break the site's own rule and the
trust it's trying to build; the slot is ready for a real one.

## Seventh pass: reading it as a distributor would

The structure held up; the details didn't all. Read cold, as a distributor deciding whether to pay:

| Problem | Change |
|---|---|
| The workspace came after the demo, so you were asked to try it before seeing everything you'd pay for | It follows "How it works" directly: get the sale, keep the customer, then try it, then the price |
| The hero sold the page but not the follow-up, which is why the subscription is worth keeping | One more sentence: "Then you're reminded who to follow up, and when they're due to reorder" |
| "Don't take our word for it" read like a sales cliché | "Try it the way your customers will" |
| "Where most sales get lost" and "What distributors usually ask" implied numbers and users we don't have yet | "Where sales get lost" and "Questions before you start" |
| The problems were numbered 1 to 4 right before the steps numbered 1 to 3, so they read like steps | A plain divided list |
| A large empty dark area sat beside the demo phone | The four trust points fill that column |
| The workspace headline ("And it remembers every customer") didn't say what "it" was, and pricing then sold a "workspace" nobody had named | "Your workspace remembers every customer" |
| The hero's price line could wrap with a separator left dangling on phones | Two tidy lines on phones, one on wider screens |

**Follow-up.** Step 1 of "How it works" shows Kate's printable QR card again (`QrCard size="sm"`), the
design the earlier homepage used; its QR code really opens her page. Step 2 explains each product by
what Sarah said ("Because you said your energy is low and dips mid-afternoon"), and `story.test.ts`
checks those words against her actual answers.

## Eighth pass: the founder's copy

A copy pass on the same seven sections, read as one story: Turn Curiosity Into Customers → Where
Sales Get Lost → Share a Link. They Get a Plan. You Close the Sale. → See It in Action → Know Who
Needs You Next → What Distributors Usually Ask → Your Page Can Be Live This Afternoon. "See it in
action" comes before the workspace again, in that order. Headings use the founder's capitalisation;
supporting text stays in sentence case. The problem section describes the process, not the person.
The FAQ answers the nine practical questions distributors raise (selling the same way, customers
staying theirs, direct WhatsApp, payment, stopping, the 50-customer limit, medical advice, phones).
Pricing names Starter as the place to start, with Growth and Pro as two small options beneath it.

**Follow-up.** The hero's audience tag and headline are one headline: "Helping BF Suma Distributors in
Kenya Turn Curiosity Into Customers", set a little smaller than `display-xl` since it's a full sentence.

**Follow-up.** On phones and small tablets the hero is text only: the looping phone stacked under the
buttons and pushed the rest of the page down. The live demo further down shows the same screens.

**Follow-up.** No eyebrow labels anywhere (homepage, privacy, not found): each section opens on its
heading, intros are stacked on the left (pricing stays centred), and every section uses the same
vertical padding. The FAQ heading stays in view while you read the answers on desktop.

**Follow-up.** Section titles say what each section is, so the page reads as a sequence: Where WhatsApp
Sales Get Lost → How Suppli Afya Works → Example Distributor Page → Your Daily Follow-Up List → Common
Questions → Simple Monthly Pricing. The hero subtext now says customers find "what products suit them".

**Follow-up.** Every sentence says who is doing what, so no section relies on the one before it: the
problem opens with "Potential customers usually message you…", the steps are "Share your page link",
"Customers get their own plan" and "You finish the sale on WhatsApp", the workspace is introduced as
the private side of your page that only you can see, and the example page says plainly that Kate is a
distributor and that yours is set up the same way.

**Follow-up.** A copy review scored the page 7.6/10 and these were fixed: "plan" now only means the
customer's product plan (the distributor pays a "subscription"); the page says enquiries are
unlimited on every plan and what counts as a customer; the price shows what it is per day; the FAQ
answers whether the assessment is in Swahili (not yet) and what happens when a subscription ends
(the page goes offline three days later, records are kept); the longest sentences are split; and the
hero subtext says what the page does ("asks potential customers a few short questions").

**Follow-up.** The headline is now "Helping BF Suma Distributors Turn Product Interest Into Actual
Customers", set in phrases so every line is a complete thought at every width: Helping BF Suma /
Distributors / Turn Product Interest / Into *Actual* Customers. "Actual" is in italic because it's
the word you'd stress saying it aloud. "BF Suma" never splits, and the smallest size is 2.2rem so the
two phrase lines fit a 360px phone.
