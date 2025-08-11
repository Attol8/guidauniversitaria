// src/components/CourseDetail/format.ts
export type AnyCourse = Record<string, any>;

export function mapLanguage(c: AnyCourse): string {
  const name = c?.language?.name || c?.lingua;
  if (!name) return "N/D";
  const v = String(name).toUpperCase();
  if (v === "IT" || v.includes("ITAL")) return "Italiano";
  if (v === "EN" || v.includes("INGL")) return "Inglese";
  if (v === "MU" || v.includes("MULTI")) return "Multilingua";
  return name;
}

export function getUniversity(c: AnyCourse): string {
  return c?.university?.name || c?.nomeStruttura || "N/D";
}

export function getCity(c: AnyCourse): string {
  const a = c?.location?.name || c?.sede?.comuneDescrizione;
  if (!a) return "N/D";
  const lower = String(a).toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function getDegreeType(c: AnyCourse): string {
  return c?.degree_type?.name || c?.tipoLaurea?.descrizione || "N/D";
}

export function getAdmission(c: AnyCourse): string {
  return c?.modalitaAccesso?.descrizione || "N/D";
}

export function getEntrance(c: AnyCourse): string {
  return c?.program_type?.name || c?.programmazione?.descrizione || "N/D";
}

export function getDelivery(c: AnyCourse): string {
  return c?.modalitaDidattica?.descrizione || c?.modalitaErogazione?.descrizione || "N/D";
}

export function getDurationYears(c: AnyCourse): string {
  if (c?.durataAnni) return `${c.durataAnni} anni`;
  return "N/D";
}

export function getMinisterialClass(c: AnyCourse): { code: string; label: string; cfu?: number } {
  const code = c?.classe?.codice || "";
  const label = c?.classe?.descrizione || "";
  const cfu = c?.classe?.totaleCfu;
  return { code, label, cfu };
}

export function getAcademicYear(c: AnyCourse): string {
  return c?.anno?.descrizione || "N/D";
}

export function getOfficialUrl(c: AnyCourse): string | null {
  return c?.url || null;
}

export function pickHeroImage(courseId?: string | number): string {
  // Deterministic pseudo-random pick (expects files 1..8 to exist)
  const n = 8;
  const idNum = Number(courseId ?? 1);
  const idx = ((isNaN(idNum) ? 1 : idNum) % n) + 1;
  return `/images/uni_images/uni_heroes/${idx}_hero.jpg`;
}