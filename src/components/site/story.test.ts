import { describe, expect, it } from "vitest";
import { PRODUCTS_BY_ID, recommend, whatsappMessage } from "@/engine";
import { ARTHROXTRA_EXPECTATION, KATE, PLAN_REF, SARAH_ANSWERS, SARAH_MESSAGE, SUGGESTED } from "./story";

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

  it("explains each product with what Sarah actually answered", () => {
    const [coffee, joints] = SUGGESTED;
    expect(coffee.because).toContain("energy is low and dips mid-afternoon");
    expect(SARAH_ANSWERS.energy_level).toBeLessThanOrEqual(2);
    expect(SARAH_ANSWERS.energy_dips).toContain("afternoon");
    expect(joints.because).toContain("joint pain for more than a year");
    expect(SARAH_ANSWERS.joint_issues).toContain("pain");
    expect(SARAH_ANSWERS.joint_duration).toBe("years");
  });

  it("writes the same WhatsApp message", () => {
    expect(result.ref).toBe(PLAN_REF);
    expect(whatsappMessage(result, { distributorName: KATE.name, distributorFirstName: KATE.first })).toBe(SARAH_MESSAGE);
  });

  it("checks in with what the product's label says to expect", () => {
    expect(ARTHROXTRA_EXPECTATION).toBe(PRODUCTS_BY_ID.arthroxtra.expectation);
  });
});
