import { describe, expect, it } from "vitest";
import { PRODUCTS_BY_ID, distributorBrief, recommend, whatsappMessage } from "@/engine";
import { ARTHROXTRA_EXPECTATION, CHECKIN_MESSAGE, KATE, KATE_OPENER, PLAN_REF, SARAH_ANSWERS, SARAH_MESSAGE, SUGGESTED, ownerFor } from "./story";

/** The homepage shows the product working. If the engine or catalogue changes, the story must follow. */
describe("the homepage story matches the real engine", () => {
  const result = recommend(SARAH_ANSWERS);

  it("suggests the same products, for the same reasons", () => {
    expect(result.status).toBe("ready");
    expect(result.core.map((c) => c.product.id)).toEqual(SUGGESTED.map((p) => p.id));
    for (const [i, p] of SUGGESTED.entries()) {
      const real = PRODUCTS_BY_ID[p.id];
      expect(real.name).toBe(p.name);
      expect(real.format).toBe(p.format);
      expect(real.line).toBe(p.line);
      expect(result.core[i].reasons[0]).toBe(p.why);
    }
  });

  it("writes the same WhatsApp message and first reply", () => {
    expect(result.ref).toBe(PLAN_REF);
    expect(whatsappMessage(result, { distributorName: KATE.name, distributorFirstName: KATE.first })).toBe(SARAH_MESSAGE);
    expect(distributorBrief(result).opener).toBe(KATE_OPENER);
  });

  it("checks in with what the first product's label says to expect", () => {
    expect(CHECKIN_MESSAGE.endsWith(PRODUCTS_BY_ID[SUGGESTED[0].id].expectation)).toBe(true);
    expect(ARTHROXTRA_EXPECTATION).toBe(PRODUCTS_BY_ID.arthroxtra.expectation);
  });
});

describe("putting your own name on the example page", () => {
  it("builds a name, initials and link from what was typed", () => {
    const o = ownerFor("  Grace   Wambui ");
    expect(o.name).toBe("Grace Wambui");
    expect(o.first).toBe("Grace");
    expect(o.initials).toBe("GW");
    expect(o.link.endsWith("/d/grace-wambui")).toBe(true);
  });

  it("falls back to Kate when empty, and never builds a broken link", () => {
    expect(ownerFor("   ")).toBe(KATE);
    expect(ownerFor("Ñjeri").link.endsWith("/d/njeri")).toBe(true);
    expect(ownerFor("✨✨").link.endsWith("/d/your-name")).toBe(true);
  });
});
