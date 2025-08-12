// src/components/Courses/__tests__/filterUtils.test.ts
import { describe, it, expect } from "vitest";
import { encodeFilters, hasActiveFilters, type FiltersState } from "../filterUtils";

describe("filter utils", () => {
  it("encodes only non-default params", () => {
    const f: FiltersState = {
      q: "   data science ",
      discipline: "ingegneria",
      location: "",
      university: "",
      sort: "name_asc", // default, should be omitted
    };
    const p = encodeFilters(f);
    expect(p.get("q")).toBe("data science");
    expect(p.get("discipline")).toBe("ingegneria");
    expect(p.get("sort")).toBeNull();
    expect(p.get("location")).toBeNull();
    expect(p.get("university")).toBeNull();
  });

  it("includes sort when not default", () => {
    const f: FiltersState = { q: "", discipline: "", location: "", university: "", sort: "name_desc" };
    const p = encodeFilters(f);
    expect(p.get("sort")).toBe("name_desc");
  });

  it("detects active filters", () => {
    expect(hasActiveFilters({ q: "", discipline: false, location: false, university: false })).toBe(false);
    expect(hasActiveFilters({ q: "x", discipline: false, location: false, university: false })).toBe(true);
    expect(hasActiveFilters({ q: "", discipline: true, location: false, university: false })).toBe(true);
  });
});