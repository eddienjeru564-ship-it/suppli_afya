import type { Product } from "@/engine";

/**
 * Plain "before you take it" notes, read from the same product traits the
 * health check's safety rules use. Cautious by design.
 */
export function beforeYouTake(p: Product, firstName: string): string[] {
  const t = p.traits;
  const out: string[] = [];
  if (t.topical) out.push("For external use only.");
  if (t.notInPregnancy) out.push("Not for use while pregnant or breastfeeding.");
  if (t.caffeine) out.push("Contains caffeine. Best earlier in the day, and not for anyone avoiding caffeine.");
  if (t.stimulant) out.push("Contains stimulating ingredients. Check with a doctor first if you have high blood pressure or a heart condition.");
  if (t.mayContainSugar) out.push("Sachet blends can contain sugar or creamer. Check the label if you're watching your sugar.");
  if (t.lowersBloodSugar) out.push("Can lower blood sugar. If you take diabetes medicine, check with your doctor first.");
  if (t.mayLowerBp) out.push("May lower blood pressure. If you take blood pressure medicine, check with your doctor first.");
  if (t.clotting === "strong") out.push("Can affect blood clotting. Not with blood thinners unless your doctor agrees.");
  if (t.clotting === "mild") out.push("May affect blood clotting slightly. Mention it to your doctor if you take blood thinners.");
  if (t.moodMedInteraction) out.push("Can interact with antidepressants and sleeping pills. Check with your doctor first.");
  if (t.immuneActive) out.push("Works on the immune system. Check with your doctor if you have an autoimmune condition or take medicine that suppresses immunity.");
  if (t.shellfish) out.push("Made with shellfish-derived ingredients. Not for anyone with a shellfish allergy.");
  if (t.pork) out.push("Contains pork-derived ingredients.");
  if (t.porkUnconfirmed) out.push(`The source of one ingredient isn't confirmed. If you avoid pork, ask ${firstName} before buying.`);
  if (t.soy) out.push("Contains soy.");
  if (p.note) out.push(p.note);
  out.push("If you take prescription medicine or manage a condition, check with your doctor or pharmacist before starting.");
  return out;
}
