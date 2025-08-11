// src/app/courses/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import LeadForm from "../../../components/LeadForm/LeadForm";
import CourseBadges from "../../../components/CourseDetail/CourseBadges";
import KeyFacts from "../../../components/CourseDetail/KeyFacts";
import {
  getUniversity,
  getCity,
  mapLanguage,
  pickHeroImage,
  getOfficialUrl,
} from "../../../components/CourseDetail/format";
import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";

type Course = Record<string, any>;

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qs = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCTA, setOpenCTA] = useState(false);
  const leadRef = useRef<HTMLDivElement | null>(null);

  // fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "courses", id));
        if (!mounted) return;
        setCourse(snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // open CTA via URL ?richiedi-info=1 or #richiedi-info
  useEffect(() => {
    const viaQuery = qs.get("richiedi-info") === "1";
    const viaHash = typeof window !== "undefined" && window.location.hash === "#richiedi-info";
    if (viaQuery || viaHash) setOpenCTA(true);
  }, [qs]);

  const hero = useMemo(() => {
    if (!course) return null;
    const uni = getUniversity(course);
    const city = getCity(course);
    const lang = mapLanguage(course);
    const cover = pickHeroImage(course.id);
    const url = getOfficialUrl(course);
    return { uni, city, lang, cover, url };
  }, [course]);

  const openLead = () => {
    setOpenCTA(true);
    // reflect UI state in URL (no scroll)
    const params = new URLSearchParams(qs as any);
    params.set("richiedi-info", "1");
    router.replace(`/courses/${id}?${params.toString()}`, { scroll: false });
    // scroll to form (desktop)
    setTimeout(() => leadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-48 w-full bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="alert alert-error">Corso non trovato.</div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* HERO */}
      <div
        className="relative w-full"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url('${hero?.cover}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
              {course.nomeCorso || course.title || "Corso"}
            </h1>
            <p className="text-white/90 text-sm md:text-base">
              {hero?.uni} • {hero?.city} • {hero?.lang}
            </p>
            <div className="mt-4">
              <CourseBadges course={course} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={openLead}>
                Richiedi informazioni
              </button>
              {hero?.url && (
                <a
                  href={hero.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Sito ufficiale <FaExternalLinkAlt className="ml-2" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <KeyFacts course={course} />

            <div className="rounded-lg bg-white dark:bg-dark shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Panoramica</h2>
              <p className="text-sm text-gray-700 dark:text-body-color-dark">
                Questo corso appartiene alla classe {course?.classe?.codice ?? "N/D"} –{" "}
                {course?.classe?.descrizione ?? "N/D"} ({course?.classe?.totaleCfu ?? "N/D"} CFU totali).
                Modalità didattica: {course?.modalitaDidattica?.descrizione ?? "N/D"}. Accesso:{" "}
                {course?.modalitaAccesso?.descrizione ?? "N/D"}. Selettività:{" "}
                {course?.programmazione?.descrizione ?? "N/D"}.
              </p>
              {hero?.url && (
                <div className="mt-3 text-sm">
                  Maggiori dettagli e piano di studi sul{" "}
                  <a
                    className="link link-primary"
                    href={hero.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    sito ufficiale
                  </a>.
                </div>
              )}

              <div className="mt-4 alert">
                <FaInfoCircle className="mr-2" />
                <span>
                  I contenuti sono generici e derivati dai metadati ufficiali. Per requisiti, scadenze e
                  piano dettagliato, fare riferimento al sito dell'ateneo.
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar: Lead capture */}
          <aside className="lg:col-span-1">
            <div ref={leadRef} className={`sticky top-6 transition ${openCTA ? "ring-2 ring-primary rounded-lg" : ""}`}>
              <div className="rounded-lg bg-white dark:bg-dark shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Richiedi informazioni</h3>
                <LeadForm
                  courseId={String(course.id ?? id)}
                  courseName={course.nomeCorso}
                  onSubmitted={() => setOpenCTA(false)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
        <button className="btn btn-primary w-full" onClick={openLead}>
          Richiedi informazioni
        </button>
      </div>

      {/* Mobile modal */}
      {openCTA && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:hidden">
          <div className="w-full bg-white dark:bg-dark rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Richiedi informazioni</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenCTA(false)}>
                Chiudi
              </button>
            </div>
            <LeadForm
              courseId={String(course.id ?? id)}
              courseName={course.nomeCorso}
              onSubmitted={() => setOpenCTA(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}