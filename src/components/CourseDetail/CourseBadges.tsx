// src/components/CourseDetail/CourseBadges.tsx
"use client";

import {
  getCity,
  getDegreeType,
  getDelivery,
  getDurationYears,
  getEntrance,
  mapLanguage,
} from "./format";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium">
    {children}
  </span>
);

export default function CourseBadges({ course }: { course: Record<string, any> }) {
  const pills = [
    getDegreeType(course),
    getDurationYears(course),
    getEntrance(course),
    getDelivery(course),
    mapLanguage(course),
    getCity(course),
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p, i) => (
        <Pill key={i}>{p}</Pill>
      ))}
    </div>
  );
}