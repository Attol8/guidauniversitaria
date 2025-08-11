// src/components/CourseDetail/KeyFacts.tsx
"use client";

import {
  getAcademicYear,
  getAdmission,
  getCity,
  getDelivery,
  getDegreeType,
  getDurationYears,
  getEntrance,
  getMinisterialClass,
  mapLanguage,
  getOfficialUrl,
} from "./format";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function KeyFacts({ course }: { course: Record<string, any> }) {
  const m = getMinisterialClass(course);
  const rows = [
    { k: "Anno Accademico", v: getAcademicYear(course) },
    { k: "Titolo", v: getDegreeType(course) },
    { k: "Classe ministeriale", v: [m.code, m.label].filter(Boolean).join(" – ") || "N/D" },
    { k: "Totale CFU", v: m.cfu ? String(m.cfu) : "N/D" },
    { k: "Durata", v: getDurationYears(course) },
    { k: "Accesso", v: getAdmission(course) },
    { k: "Selettività", v: getEntrance(course) },
    { k: "Modalità Didattica", v: getDelivery(course) },
    { k: "Lingua", v: mapLanguage(course) },
    { k: "Sede", v: getCity(course) },
  ];

  const url = getOfficialUrl(course);

  return (
    <div className="rounded-lg bg-white dark:bg-dark shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dettagli del corso</h2>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
          >
            Sito ufficiale <FaExternalLinkAlt className="ml-2" />
          </a>
        )}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {rows.map((r) => (
          <div key={r.k} className="flex flex-col">
            <dt className="text-gray-500">{r.k}</dt>
            <dd className="font-medium">{r.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}