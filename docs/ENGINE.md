# The health check engine

`src/engine/` is pure TypeScript: answers in, recommendation out. No React, no network, no
storage. It runs in the browser today and can run on a server unchanged when the portal needs
to store results.

## Files

| File | What it does |
|---|---|
| `questions.ts` | The question flow, in display order, with `showIf` branching |
| `goals.ts` | The 13 goals a customer can rank |
| `flow.ts` | Which questions are visible, validation, option toggling, pruning stale answers |
| `profile.ts` | Turns answers into weighted **signals** (0..1) |
| `catalogue.ts` | BF Suma products: what they are, what they support, safety traits |
| `safety.ts` | Product-level exclusions and cautions; plan-level status |
| `recommend.ts` | Scoring, one product per goal, plan size, add-ons, exclusions |
| `advice.ts` | "Because you said…" fallbacks, habits, see-a-doctor flags, summary |
| `handoff.ts` | The WhatsApp message and the distributor's lead brief |
| `engine.test.ts` | Scenario tests and a 3,000-run fuzz test of safety invariants |

## How a plan is built

1. **Prune.** Answers to questions that are no longer shown are dropped (`pruneAnswers`).
2. **Profile.** Each answer raises one or more signals, e.g. constipation "most weeks" →
   `constipation: 0.8`. Signals from a chosen goal remember that goal; signals from lifestyle
   answers (low vegetables, alcohol) have no goal and count for less.
3. **Weight.** Goal rank sets weight: 1st = 1.0, 2nd = 0.82, 3rd = 0.68. Lifestyle = 0.4.
4. **Score.** For each product: sum of `signal × product affinity × weight`. Premium products are
   discounted unless the customer asked for a complete plan. Sachets that may contain sugar are
   discounted for people watching sugar.
5. **Safety.** Every product goes through `checkProduct`. It's either excluded (with a reason
   shown to the customer under "What we left out, and why") or kept with cautions.
6. **Pick.** One headline product per ranked goal. A product that already covers a goal isn't
   duplicated. Products in the same `group` (e.g. two glucosamine formulas, two coffees) are
   never recommended together.
7. **Size.** `one` → 1 product; `focused` → up to 3; `complete` → up to 4. Strong leftovers
   become "worth considering later" add-ons.
8. **Plan status.** `ready`, `review` (show to a doctor or pharmacist first: medicines, kidney or
   liver disease, cancer, ARVs) or `clinic-first` (pregnant, breastfeeding or trying: no product plan).
9. **Extras.** Up to four habits, see-a-doctor notes, a plain summary, and a reference code (`SA-XXXX`).

## Safety rules (summary)

| Situation | Effect |
|---|---|
| Pregnant, breastfeeding, trying to conceive | No product plan. Clinic first. |
| Shellfish allergy | Exclude glucosamine products and Ez-Xlim (chitosan) |
| Avoids pork / vegetarian | Exclude GluzoJoint-F; caution on ArthroXtra until chondroitin source is confirmed |
| Soy allergy | Exclude Detoxilive |
| Caffeine doesn't agree | Exclude coffees |
| Blood thinners or bleeding disorder | Exclude MicrO2 Cycle and CereBrain; caution on reishi |
| Diabetes medicine | Caution on anything that lowers blood sugar |
| High blood pressure or heart disease | Exclude stimulant products; exclude performance products with heart disease |
| Antidepressants / sleeping pills | Caution on ginkgo |
| Autoimmune condition or cancer treatment | Caution on immune mushrooms |
| Kidney/liver disease, cancer, ARVs, other prescription medicine | Whole plan marked for professional review |

Rules read product **traits**, not product ids. Fix a trait in the catalogue and the rules follow.

## Adding or correcting a product

1. Check it against the official BF Suma Kenya catalogue and the pack label.
2. Fill every field in `catalogue.ts`. Be strict with `traits` (shellfish, pork, soy, caffeine,
   sugar, stimulant, clotting, blood sugar). Set `supplyDays` from the label dose and pack size.
3. Write `summary`, `reasons` and `expectation` in plain words. Say what it is and what people use
   it for. **Never** say it treats, cures or prevents a disease.
4. Set `verified: true` only after the line-by-line check.
5. Run `npm test`. The fuzz test will catch a product that breaks a safety invariant.

## Writing rules for anything the customer reads

- Plain English, short sentences, no jargon. Explain ingredients in a few words.
- "Because you said…" reasons tie every product to the customer's own answers.
- Honest timelines: weeks or months, never days, for anything but digestion and coffee.
- Supplements never replace medicine. Say so whenever medicine is involved.
- When unsure, tell them to check with a doctor or pharmacist, and say why.

## Known limits

- The catalogue is unverified (see `docs/DECISIONS.md`).
- Interaction rules are conservative general guidance, not a clinical interaction database.
  Have a pharmacist review `safety.ts` before launch.
- Adults only (18+). BF Suma's Smart Kids range needs its own flow.
- English only. A Swahili version would widen reach; translate carefully, especially safety text.
