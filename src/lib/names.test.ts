import { describe, expect, it } from "vitest";
import { greetingName } from "./names";

describe("greetingName", () => {
  it("uses the first name", () => {
    expect(greetingName("Otieno Kamau")).toBe("Otieno");
    expect(greetingName("  Wanjiru   Mwangi ")).toBe("Wanjiru");
  });

  it("keeps a form of address with the name after it", () => {
    expect(greetingName("Mama Njeri")).toBe("Mama Njeri");
    expect(greetingName("mzee Kamau Otieno")).toBe("mzee Kamau");
    expect(greetingName("Dr. Achieng Odhiambo")).toBe("Dr. Achieng");
    expect(greetingName("Pastor John")).toBe("Pastor John");
  });

  it("copes with a title on its own, labels after a comma, and nothing at all", () => {
    expect(greetingName("Mama")).toBe("Mama");
    expect(greetingName("Wanjiru, 34")).toBe("Wanjiru");
    expect(greetingName("")).toBe("");
    expect(greetingName(null)).toBe("");
  });
});
