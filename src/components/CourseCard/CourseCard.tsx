// src/components/CourseCard/CourseCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Course = {
  id: string | number;
  nomeCorso?: string;
  university?: { id?: string; name?: string };
  location?: { id?: string; name?: string };
  discipline?: { id?: string; name?: string };
};

type Props = { course: Course };

function slugify(input?: string) {
  if (!input) return "";
  return input.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function buildLogoCandidates(uniId?: string, uniName?: string, numeric?: string) {
  const base = "/images/uni_images/uni_logos";
  const slug = slugify(uniName);
  const id = (uniId || "").trim();

  const v = new Set<string>();
  // alias numerico (es. 31_logo.png)
  if (numeric) {
    v.add(`${base}/${numeric}_logo.png`);
    v.add(`${base}/${numeric}.png`);
    v.add(`${base}/${numeric}_logo.jpg`);
    v.add(`${base}/${numeric}.jpg`);
  }
  // id come arriva dal corso (slug)
  if (id) {
    v.add(`${base}/${id}_logo.png`);
    v.add(`${base}/${id}.png`);
    v.add(`${base}/${id}_logo.jpg`);
    v.add(`${base}/${id}.jpg`);
  }
  // ridondanza sullo slug del nome
  if (slug && slug !== id) {
    v.add(`${base}/${slug}_logo.png`);
    v.add(`${base}/${slug}.png`);
    v.add(`${base}/${slug}_logo.jpg`);
    v.add(`${base}/${slug}.jpg`);
  }
  // fallback finale
  v.add("/images/logo/online-learning.png");
  return Array.from(v);
}

function useImageFallback(candidates: string[]) {
  const i = useRef(0);
  const [src, setSrc] = useState(candidates[0]);
  const onError = () => {
    i.current += 1;
    if (i.current < candidates.length) setSrc(candidates[i.current]);
  };
  return { src, onError };
}

function UniLogo({ uniId, uniName, size = 56 }: { uniId?: string; uniName?: string; size?: number }) {
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const slug = useMemo(() => slugify(uniName), [uniName]);

  useEffect(() => {
    fetch("/images/uni_images/uni_logos/aliases.json")
      .then(r => (r.ok ? r.json() : {}))
      .then((j) => setAliases(j || {}))
      .catch(() => {});
  }, []);

  const numeric = aliases[uniId || ""] || (slug ? aliases[slug] : undefined);
  const guesses = useMemo(() => buildLogoCandidates(uniId, uniName, numeric), [uniId, uniName, numeric]);
  const { src, onError } = useImageFallback(guesses);

  return (
    <div className="relative shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700"
         style={{ height: size, width: size }}>
      <Image
        src={src}
        alt={uniName ? `Logo ${uniName}` : "Logo università"}
        fill
        sizes={`${size}px`}
        onError={onError}
        style={{ objectFit: "contain", padding: 6 }}
        unoptimized
      />
    </div>
  );
}

export default function CourseCard({ course }: Props) {
  const title = course.nomeCorso || "Corso";
  const uni = course.university?.name || "Ateneo";
  const city = course.location?.name || "Città";
  const disc = course.discipline?.name || "Disciplina";

  return (
    <article className="group rounded-lg border border-gray-200 bg-white shadow transition hover:shadow-md dark:border-gray-800 dark:bg-dark">
      <div className="p-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <UniLogo uniId={course.university?.id} uniName={course.university?.name} />
          <Link
            href={`/courses/${course.id}`}
            className="text-base font-semibold leading-snug line-clamp-2 hover:text-primary"
            title={title}
          >
            {title}
          </Link>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border px-2 py-1 text-gray-700 dark:text-gray-300 dark:border-gray-700">
            {uni}
          </span>
          <span className="rounded-full border px-2 py-1 text-gray-700 dark:text-gray-300 dark:border-gray-700">
            {city}
          </span>
          <span className="rounded-full border px-2 py-1 text-gray-700 dark:text-gray-300 dark:border-gray-700">
            {disc}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link href={`/courses/${course.id}#richiedi-info`} className="btn btn-primary btn-sm">
            Richiedi info
          </Link>
          <Link href={`/courses/${course.id}`} className="btn btn-ghost btn-sm">
            Dettagli
          </Link>
        </div>
      </div>
    </article>
  );
}