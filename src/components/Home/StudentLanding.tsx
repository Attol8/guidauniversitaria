// src/components/Home/StudentLanding.tsx
"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select, { SingleValue, StylesConfig } from "react-select";
import { collection, getDocs, limit as fsLimit, orderBy, query as fsQuery } from "firebase/firestore";
import { db } from "@/../firebaseConfig";
import { getTopDisciplines } from "@/components/getTopDisciplines";
import { getTopLocations } from "@/components/getTopLocations";
import { getTopUniversities } from "@/components/getTopUniversities";

type Opt = { value: string; label: string };

// Home page redesigned for prospective students — clean, conversion-focused, no background boat image.
// TailwindCSS required. Icons via inline SVG to avoid external deps.

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <Hero />
      <TrustBar />
      <Benefits />
      <Highlights />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}


function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {/* subtle decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 items-center gap-8">
          <div className="lg:col-span-7">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Scegli l&apos;università giusta.<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Inizia oggi.</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Confronta corsi, requisiti e opportunità di carriera. Trova in pochi minuti il percorso di studi più adatto a te.
            </p>
            <div className="mt-6">
              <SmartSearchBar />
            </div>
            <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-blue-700"/>1000+ corsi indicizzati</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-blue-700"/>Filtri intelligenti</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-blue-700"/>Consulenza gratuita</li>
            </ul>
          </div>
          <div className="lg:col-span-5">
            <PromoCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const [unis, setUnis] = useState<Array<{ id: number; docId: string; title: string; path: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getTopUniversities(6);
        if (active) setUnis(data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-label="In evidenza" className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">In evidenza</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 opacity-80">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
            ))}
            {!loading && unis.map((u) => (
              <a key={u.docId} href={u.path} className="h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium hover:bg-slate-200">
                {u.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// (Secondary SearchSection removed per UX request)

function Benefits() {
  const items = [
    {
      title: "Filtri che contano",
      desc: "Affiniamo i risultati per città, durata, lingua, costi e sbocchi professionali.",
      icon: <FunnelIcon className="h-6 w-6"/>,
    },
    {
      title: "Consigli neutri",
      desc: "Dati chiari, senza fronzoli: pro e contro di ogni corso per decidere con sicurezza.",
      icon: <CompassIcon className="h-6 w-6"/>,
    },
  ];

  return (
    <section id="benefits" className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it) => (
            <div key={it.title} className="card">
              <div className="flex items-center gap-3">
                <div className="icon-wrap">{it.icon}</div>
                <h3 className="font-semibold text-lg">{it.title}</h3>
              </div>
              <p className="mt-3 text-slate-600">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const [topCourses, setTopCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [topCities, setTopCities] = useState<Array<{ docId: string; title: string }>>([]);
  const [topUnis, setTopUnis] = useState<Array<{ docId: string; title: string }>>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Approximation for "top courses": just pick 3 deterministic entries alphabetically
        const snap = await getDocs(fsQuery(collection(db, "courses"), orderBy("nomeCorso"), fsLimit(3)));
        if (!alive) return;
        setTopCourses(snap.docs.map(d => ({ id: d.id, title: (d.data() as any).nomeCorso || "Corso" })));
      } catch {/* ignore */}
      try {
        const cities = await getTopLocations(4);
        if (!alive) return;
        setTopCities(cities.map(c => ({ docId: c.docId, title: c.title })));
      } catch {/* ignore */}
      try {
        const unis = await getTopUniversities(3);
        if (!alive) return;
        setTopUnis(unis.map(u => ({ docId: u.docId, title: u.title })));
      } catch {/* ignore */}
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold text-lg">Top corsi del mese</h3>
            <p className="mt-2 text-slate-600">I più cercati dagli studenti come te.</p>
            <ul className="mt-4 space-y-2">
              {topCourses.map((c) => (
                <li key={c.id}><a className="link" href={`/courses/${c.id}`}>{c.title}</a></li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg">Città popolari</h3>
            <p className="mt-2 text-slate-600">Vita universitaria, stage, opportunità.</p>
            <ul className="mt-4 space-y-2">
              {topCities.map((l) => (
                <li key={l.docId}><a className="link" href={`/corsi?location=${l.docId}`}>{l.title}</a></li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg">Atenei in evidenza</h3>
            <p className="mt-2 text-slate-600">I più completi per offerta formativa.</p>
            <ul className="mt-4 space-y-2">
              {topUnis.map((u) => (
                <li key={u.docId}><a className="link" href={`/corsi?university=${u.docId}`}>{u.title}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: 1, title: "Cerca", desc: "Digita l'area di interesse o la città." },
    { num: 2, title: "Filtra", desc: "Affina per costi, lingua, durata, opportunità." },
    { num: 3, title: "Confronta", desc: "Valuta piani di studio e sbocchi." },
    { num: 4, title: "Richiedi info", desc: "Invia la richiesta e ricevi risposta veloce." },
  ];
  return (
    <section id="how" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Come funziona</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="card">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {s.num}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <p className="mt-2 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      text: "Ho trovato il mio master in una settimana. Filtri utilissimi e risposta delle università rapida.",
      name: "Giulia, 22 anni",
    },
    {
      text: "Volevo cambiare corso: qui ho capito le differenze e gli sbocchi.",
      name: "Andrea, 20 anni",
    },
    {
      text: "Comodo vedere costi e città a colpo d'occhio.",
      name: "Marta, 19 anni",
    },
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <figure key={i} className="card">
              <svg aria-hidden="true" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8v-8H6.83A3.83 3.83 0 0 1 10.66 10h.01V6H7.17Zm12 0A5.17 5.17 0 0 0 14 11.17V22h8v-8h-3.17A3.83 3.83 0 0 1 22.66 10h.01V6h-3.5Z"/></svg>
              <blockquote className="mt-3 text-slate-700">&quot;{q.text}&quot;</blockquote>
              <figcaption className="mt-3 text-sm text-slate-500">{q.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qa = [
    {
      q: "Quanto costa?",
      a: "La ricerca è gratuita. Alcuni corsi potrebbero avere costi di iscrizione indicati nelle schede.",
    },
    {
      q: "Posso chiedere supporto?",
      a: "Sì, puoi parlare con un orientatore: ti aiutiamo su ammissioni, test e borse di studio.",
    },
    {
      q: "Come contatto l'università?",
      a: "Dalla scheda corso invia una richiesta: arriva direttamente all'ateneo o partner.",
    },
  ];
  return (
    <section id="faq" className="py-16 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Domande frequenti</h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {qa.map((item, idx) => (
            <details key={idx} className="group px-5 sm:px-6 py-4 open:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-medium">{item.q}</span>
                <span className="transition-transform group-open:rotate-180" aria-hidden>
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                </span>
              </summary>
              <p className="mt-2 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-10 text-white overflow-hidden relative">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pronto a iniziare?</h2>
          <p className="mt-2 text-blue-100 max-w-2xl">Cerca tra centinaia di corsi e richiedi informazioni in un click.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/corsi" className="btn-white">Sfoglia tutti i corsi</a>
            <a href="#search" className="btn-outline-white">Trova ora</a>
          </div>
        </div>
      </div>
    </section>
  );
}


/* -------------------- Widgets -------------------- */

function SearchBar({ large = false }: { large?: boolean }) {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const size = large ? "h-14 text-base" : "h-12 text-sm";

  useEffect(() => {
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      const q = term.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?term=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("network");
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchSuggestions, 220);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [term]);

  const goTo = (item?: any, q?: string) => {
    if (item && item.type === "course" && item.id) {
      window.location.href = `/courses/${item.id}`;
      return;
    }
    if (item && item.type === "location" && item.id) {
      window.location.href = `/corsi?location=${encodeURIComponent(item.id)}`;
      return;
    }
    if (item && item.type === "university" && item.id) {
      window.location.href = `/corsi?university=${encodeURIComponent(item.id)}`;
      return;
    }
    const url = new URL("/corsi", window.location.origin);
    if (q?.trim()) url.searchParams.set("term", q.trim());
    window.location.href = url.toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goTo(undefined, term);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      const sel = suggestions[highlight];
      if (sel) {
        e.preventDefault();
        goTo(sel, term);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          name="term"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => term.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Cerca corso, città o università"
          className={`w-full ${size} rounded-2xl border border-slate-300 bg-white pr-36 pl-12 outline-none ring-0 focus:border-blue-600 transition`}
          autoComplete="off"
          aria-label="Cerca corsi"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2 !px-4">
          {loading ? "..." : "Cerca"}
        </button>
      </form>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {suggestions.length === 0 && !loading && (
            <div className="px-4 py-3 text-sm text-slate-500">Nessun risultato</div>
          )}

          {/* Grouped results: location, university, course */}
          {suggestions.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {(["location", "university", "course"] as const).map((group) => {
                const items = suggestions.filter((s) => s.type === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="py-1">
                    <div className="px-4 py-1 text-[11px] uppercase tracking-wide text-slate-500">
                      {group === "location" ? "Città" : group === "university" ? "Atenei" : "Corsi"}
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {items.map((s: any, i: number) => {
                        const title = s.title;
                        const subtitle = [s.university, s.location].filter(Boolean).join(" • ");
                        const id = s.id || s.docId;
                        const globalIndex = suggestions.indexOf(s);
                        return (
                          <li
                            key={`${group}-${id}-${i}`}
                            className={`px-4 py-2.5 text-sm cursor-pointer ${globalIndex === highlight ? "bg-slate-50" : ""}`}
                            onMouseEnter={() => setHighlight(globalIndex)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => goTo(s, term)}
                          >
                            <div className="font-medium text-slate-900 line-clamp-1">{title}</div>
                            {subtitle && (
                              <div className="text-xs text-slate-500 line-clamp-1">{subtitle}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SmartSearchBar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [disciplineOpts, setDisciplineOpts] = useState<Opt[]>([]);
  const [locationOpts, setLocationOpts] = useState<Opt[]>([]);
  const [universityOpts, setUniversityOpts] = useState<Opt[]>([]);

  const [discipline, setDiscipline] = useState<Opt | null>(null);
  const [location, setLocation] = useState<Opt | null>(null);
  const [university, setUniversity] = useState<Opt | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [d, l, u] = await Promise.all([
        getTopDisciplines(12),
        getTopLocations(12),
        getTopUniversities(12),
      ]);
      setDisciplineOpts(d.map((x) => ({ value: x.docId, label: x.title })));
      setLocationOpts(l.map((x) => ({ value: x.docId, label: x.title })));
      setUniversityOpts(u.map((x) => ({ value: x.docId, label: x.title })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const disableSubmit = useMemo(() => isLoading, [isLoading]);

  const goToResults = useCallback(() => {
    const params = new URLSearchParams();
    if (discipline?.value) params.set("discipline", discipline.value);
    if (location?.value) params.set("location", location.value);
    if (university?.value) params.set("university", university.value);
    router.push(`/corsi${params.size ? `?${params.toString()}` : ""}`);
  }, [router, discipline, location, university]);

  return (
    <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md shadow-sm p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <label className="flex items-center gap-2 text-xs font-medium mb-1 text-slate-700">
            <BookIcon className="h-4 w-4 text-blue-600" /> Disciplina
          </label>
          <Select
            isLoading={isLoading}
            isClearable
            value={discipline}
            onChange={(v: SingleValue<Opt>) => setDiscipline(v)}
            options={disciplineOpts}
            classNamePrefix="react-select"
            placeholder={isLoading ? "Caricamento…" : "Seleziona"}
            styles={selectStyles as StylesConfig}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="flex items-center gap-2 text-xs font-medium mb-1 text-slate-700">
            <PinIcon className="h-4 w-4 text-blue-600" /> Città
          </label>
          <Select
            isLoading={isLoading}
            isClearable
            value={location}
            onChange={(v: SingleValue<Opt>) => setLocation(v)}
            options={locationOpts}
            classNamePrefix="react-select"
            placeholder={isLoading ? "Caricamento…" : "Seleziona"}
            styles={selectStyles as StylesConfig}
          />
        </div>
        <div className="lg:col-span-1">
          <label className="flex items-center gap-2 text-xs font-medium mb-1 text-slate-700">
            <UniIcon className="h-4 w-4 text-blue-600" /> Ateneo
          </label>
          <Select
            isLoading={isLoading}
            isClearable
            value={university}
            onChange={(v: SingleValue<Opt>) => setUniversity(v)}
            options={universityOpts}
            classNamePrefix="react-select"
            placeholder={isLoading ? "Caricamento…" : "Seleziona"}
            styles={selectStyles as StylesConfig}
          />
        </div>
        <div className="lg:col-span-1 flex items-end">
          <div className="w-full">
            <button
              className="btn-primary w-full h-12 text-base transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
              onClick={goToResults}
              disabled={disableSubmit}
            >
              Cerca corsi
            </button>
            <p className="mt-1 text-[11px] text-slate-500 text-center">Suggerimento: puoi combinare più filtri per risultati migliori</p>
          </div>
        </div>
      </div>

      {!isLoading && (disciplineOpts.length || locationOpts.length || universityOpts.length) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...disciplineOpts].slice(0, 4).map((d) => (
            <button
              key={`d-${d.value}`}
              className="tag !border-blue-200 !text-blue-700 hover:!border-blue-600"
              onClick={() => { setDiscipline(d); router.push(`/corsi?discipline=${d.value}`); }}
            >{d.label}</button>
          ))}
          {[...locationOpts].slice(0, 4).map((l) => (
            <button
              key={`l-${l.value}`}
              className="tag !border-blue-200 !text-blue-700 hover:!border-blue-600"
              onClick={() => { setLocation(l); router.push(`/corsi?location=${l.value}`); }}
            >{l.label}</button>
          ))}
          {[...universityOpts].slice(0, 2).map((u) => (
            <button
              key={`u-${u.value}`}
              className="tag !border-blue-200 !text-blue-700 hover:!border-blue-600"
              onClick={() => { setUniversity(u); router.push(`/corsi?university=${u.value}`); }}
            >{u.label}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PromoCard() {
  const perks = useMemo(() => [
    "Anteprima piani di studio",
    "Sbocchi e stage",
    "Costi trasparenti",
    "Ammissioni e scadenze"
  ], []);

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Ottimizza la tua scelta</h3>
      <p className="mt-2 text-slate-600">Iscriviti per ricevere una guida pratica su test, borse e alloggi.</p>
      <form action="#" onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
        <input type="email" required placeholder="La tua email" className="input" />
        <button className="btn-primary w-full">Invia guida gratuita</button>
      </form>
      <ul className="mt-5 space-y-2 text-sm text-slate-600">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-blue-700" /> {p}</li>
        ))}
      </ul>
    </aside>
  );
}

/* -------------------- Icons (inline SVG to avoid deps) -------------------- */

function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" className="fill-blue-600"/>
      <path d="M12 6l5 2.8v5.5L12 17l-5-2.7V8.8L12 6Z" className="fill-white"/>
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-3.5-3.5" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronDown({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FunnelIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
    </svg>
  );
}

function CompassIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m16 8-4 8-4-4 8-4z" />
    </svg>
  );
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
    </svg>
  );
}

function BookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M20 22H6.5a2.5 2.5 0 0 1-2.5-2.5v-15A2.5 2.5 0 0 1 6.5 2H20v20Z" />
    </svg>
  );
}

function PinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4.5 8-10A8 8 0 1 0 4 12c0 5.5 8 10 8 10Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UniIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 2 2 10" />
      <path d="M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
      <path d="M10 12h4" />
    </svg>
  );
}

const selectStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    borderRadius: 9999,
    minHeight: 44,
    borderColor: "#e2e8f0",
    boxShadow: "none",
    backgroundColor: "white",
    ':hover': { borderColor: '#cbd5e1' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 10px' }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  menu: (base) => ({ ...base, borderRadius: 12, overflow: 'hidden' }),
};