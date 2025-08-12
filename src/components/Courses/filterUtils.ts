// src/components/Courses/filterUtils.ts

export type SortKey = "name_asc" | "name_desc" | "uni_asc" | "city_asc";
export type FiltersState = {
  discipline: string;
  location: string;
  university: string;
  sort: SortKey;
};

export function encodeFilters(f: FiltersState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.discipline) p.set("discipline", f.discipline);
  if (f.location) p.set("location", f.location);
  if (f.university) p.set("university", f.university);
  if (f.sort && f.sort !== "name_asc") p.set("sort", f.sort);
  return p;
}

export function hasActiveFilters(i: { discipline: boolean; location: boolean; university: boolean }): boolean {
  return !!(i.discipline || i.location || i.university);
}