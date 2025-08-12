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

  const candidates = [];
  
  // PRIORITY 1: ONLY use numeric alias if available - these are the files that actually exist
  if (numeric) {
    candidates.push(`${base}/${numeric}_logo.png`);  // THIS should be FIRST and PRIMARY
    candidates.push(`${base}/${numeric}_logo.jpg`);
    candidates.push(`${base}/${numeric}.png`);
    candidates.push(`${base}/${numeric}.jpg`);
  } else {
    // PRIORITY 2: id come arriva dal corso (slug) - only if no numeric mapping
    if (id) {
      candidates.push(`${base}/${id}_logo.png`);
      candidates.push(`${base}/${id}_logo.jpg`);
      candidates.push(`${base}/${id}.png`);
      candidates.push(`${base}/${id}.jpg`);
    }
    
    // PRIORITY 3: ridondanza sullo slug del nome - only if no numeric mapping and different from id
    if (slug && slug !== id) {
      candidates.push(`${base}/${slug}_logo.png`);
      candidates.push(`${base}/${slug}_logo.jpg`);
      candidates.push(`${base}/${slug}.png`);
      candidates.push(`${base}/${slug}.jpg`);
    }
  }
  
  // PRIORITY 4: fallback finale
  candidates.push("/images/logo/logo.svg");
  
  console.log(`🛠️  buildLogoCandidates(${uniId}, ${uniName}, ${numeric}) = [${candidates.join(', ')}]`);
  return candidates;
}

function useImageFallback(candidates: string[]) {
  const i = useRef(0);
  const [src, setSrc] = useState(candidates[0]);
  
  // Reset when candidates array changes
  useEffect(() => {
    console.log(`🔄 Candidates changed, resetting to first: ${candidates[0]}`);
    i.current = 0;
    setSrc(candidates[0]);
  }, [candidates[0]]);
  
  const onError = () => {
    console.log(`❌ Image failed to load: ${src} (attempt ${i.current + 1}/${candidates.length})`);
    i.current += 1;
    if (i.current < candidates.length) {
      console.log(`🔄 Trying next candidate: ${candidates[i.current]}`);
      setSrc(candidates[i.current]);
    } else {
      console.log("🚫 All image candidates exhausted");
    }
  };
  return { src, onError };
}

function UniLogo({ uniId, uniName, size = 56 }: { uniId?: string; uniName?: string; size?: number }) {
  // HARDCODED ALIASES FOR TESTING - these should work
  const aliases = {
    "libera_universita_di_bolzano": "C3",
    "universita_degli_studi_suor_orsola_benincasa__napoli": "59", 
    "link_campus_university": "A6",
    "universita_telematica_ecampus": "D9",
    "universita_degli_studi_di_perugia": "23"
  };
  const aliasesLoaded = true;
  const slug = useMemo(() => slugify(uniName), [uniName]);

  const numeric = aliases[uniId || ""] || aliases[slug] || undefined;
  const guesses = useMemo(() => {
    console.log(`🏫 HARDCODED TEST - UniLogo for "${uniName}" (id="${uniId}", slug="${slug}"):`, {
      aliasesLoaded,
      lookupKey: uniId,
      numeric,
      directTest: aliases["universita_degli_studi_di_perugia"]
    });
    
    const candidates = buildLogoCandidates(uniId, uniName, numeric);
    return candidates;
  }, [uniId, uniName, numeric, slug]);
  
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