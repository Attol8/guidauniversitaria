import { describe, it, expect } from "vitest";
import { mapLanguage, getCity, getMinisterialClass } from "../format";

describe("format helpers", () => {
  it("maps lingua codes", () => {
    expect(mapLanguage({ lingua: "IT" })).toBe("Italiano");
    expect(mapLanguage({ lingua: "EN" })).toBe("Inglese");
    expect(mapLanguage({ lingua: "mu" })).toBe("Multilingua");
  });

  it("normalizes city casing", () => {
    expect(getCity({ sede: { comuneDescrizione: "BOLZANO" } })).toBe("Bolzano");
  });

  it("reads ministerial class", () => {
    const m = getMinisterialClass({ classe: { codice: "L-1", descrizione: "Beni culturali", totaleCfu: 180 } });
    expect(m.code).toBe("L-1");
    expect(m.label).toBe("Beni culturali");
    expect(m.cfu).toBe(180);
  });
});