// src/components/CourseCard/CourseCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/providers";
import { db } from "@/../firebaseConfig";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import AuthModal from "@/components/Auth/AuthModal";

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
  const { user } = useAuth();
  const title = course.nomeCorso || "Corso";
  const uni = course.university?.name || "Ateneo";
  const city = course.location?.name || "Città";
  const disc = course.discipline?.name || "Disciplina";
  const [isFav, setIsFav] = useState<boolean>(false);
  const [checkingFav, setCheckingFav] = useState<boolean>(!!user);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) {
        setIsFav(false);
        setCheckingFav(false);
        return;
      }
      setCheckingFav(true);
      try {
        const favRef = doc(db, "users", user.uid, "favourites", String(course.id));
        const snap = await getDoc(favRef);
        if (alive) setIsFav(snap.exists());
      } finally {
        if (alive) setCheckingFav(false);
      }
    })();
    return () => { alive = false; };
  }, [user, course.id]);

  const toggleFavourite = async () => {
    if (!user) { setShowAuth(true); return; }
    const favRef = doc(db, "users", user.uid, "favourites", String(course.id));
    const next = !isFav;
    setIsFav(next);
    try {
      if (next) {
        await setDoc(favRef, {
          courseId: String(course.id),
          nomeCorso: course.nomeCorso ?? null,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        await deleteDoc(favRef);
      }
    } catch {
      setIsFav(!next);
    }
  };

  return (
    <article className="group rounded-lg border border-gray-200 bg-white shadow transition hover:shadow-md dark:border-gray-800 dark:bg-dark">
      <div className="p-4">
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} prompt="Per salvare un corso devi accedere o registrarti." />
        {/* Logo + Title */}
        <div className="flex items-start gap-3">
          <UniLogo uniId={course.university?.id} uniName={course.university?.name} />
          <div className="flex-1 min-w-0">
            <Link
              href={`/courses/${course.id}`}
              className="text-base font-semibold leading-snug line-clamp-2 hover:text-primary block"
              title={title}
            >
              {title}
            </Link>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1" title={uni}>
              {uni}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
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
          <button
            aria-label={isFav ? "Rimuovi dai preferiti" : "Salva tra i preferiti"}
            className={`btn btn-ghost btn-sm ${isFav ? "text-red-600" : ""}`}
            onClick={toggleFavourite}
            disabled={checkingFav}
            title={isFav ? "Rimuovi dai preferiti" : "Salva tra i preferiti"}
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </article>
  );
}