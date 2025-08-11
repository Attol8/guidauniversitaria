// src/components/Home/StudentLanding.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Select, { SingleValue } from "react-select";
import { getTopDisciplines } from "@/components/getTopDisciplines";
import { getTopLocations } from "@/components/getTopLocations";
import { getTopUniversities } from "@/components/getTopUniversities";

type Opt = { value: string; label: string };

export default function StudentLanding() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [disciplineOpts, setDisciplineOpts] = useState<Opt[]>([]);
  const [locationOpts, setLocationOpts] = useState<Opt[]>([]);
  const [universityOpts, setUniversityOpts] = useState<Opt[]>([]);

  const [discipline, setDiscipline] = useState<Opt | null>(null);
  const [location, setLocation] = useState<Opt | null>(null);
  const [university, setUniversity] = useState<Opt | null>(null);

  // Quick chips
  const [topDisciplines, setTopDisciplines] = useState<Opt[]>([]);
  const [topCities, setTopCities] = useState<Opt[]>([]);
  const [topUniversities, setTopUniversities] = useState<Opt[]>([]);

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

      // chips (limit to 8 for brevity)
      setTopDisciplines(d.slice(0, 8).map((x) => ({ value: x.docId, label: x.title })));
      setTopCities(l.slice(0, 8).map((x) => ({ value: x.docId, label: x.title })));
      setTopUniversities(u.slice(0, 8).map((x) => ({ value: x.docId, label: x.title })));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const disableSubmit = useMemo(
    () => isLoading || (!discipline && !location && !university),
    [isLoading, discipline, location, university]
  );

  const goToResults = useCallback(() => {
    const params = new URLSearchParams();
    if (discipline?.value) params.set("discipline", discipline.value);
    if (location?.value) params.set("location", location.value);
    if (university?.value) params.set("university", university.value);
    router.push(`/corsi${params.size ? `?${params.toString()}` : ""}`);
  }, [router, discipline, location, university]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disableSubmit) {
      e.preventDefault();
      goToResults();
    }
  };

  const Chip = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-sm hover:bg-primary hover:text-white transition"
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HERO */}
      <section
        className="relative"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url('https://picsum.photos/seed/uni-landing-2/1600/800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Trova il corso giusto, senza perdere tempo
            </h1>
            <p className="mt-3 text-white/90">
              Filtra per <strong>disciplina</strong>, <strong>città</strong> o{" "}
              <strong>ateneo</strong>. Dati ufficiali. Niente fronzoli.
            </p>
          </div>

          {/* Search Card */}
          <div
            className="mt-6 rounded-xl bg-white/95 p-4 shadow-xl backdrop-blur dark:bg-dark/95"
            onKeyDown={onKeyDown}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
                  Disciplina
                </label>
                <Select
                  isLoading={isLoading}
                  isClearable
                  value={discipline}
                  onChange={(v: SingleValue<Opt>) => setDiscipline(v)}
                  options={disciplineOpts}
                  classNamePrefix="react-select"
                  placeholder={isLoading ? "Caricamento..." : "Seleziona disciplina"}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
                  Città
                </label>
                <Select
                  isLoading={isLoading}
                  isClearable
                  value={location}
                  onChange={(v: SingleValue<Opt>) => setLocation(v)}
                  options={locationOpts}
                  classNamePrefix="react-select"
                  placeholder={isLoading ? "Caricamento..." : "Seleziona città"}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
                  Ateneo
                </label>
                <Select
                  isLoading={isLoading}
                  isClearable
                  value={university}
                  onChange={(v: SingleValue<Opt>) => setUniversity(v)}
                  options={universityOpts}
                  classNamePrefix="react-select"
                  placeholder={isLoading ? "Caricamento..." : "Seleziona ateneo"}
                />
              </div>

              <div className="col-span-1 flex items-end">
                <button
                  className="btn btn-primary w-full"
                  onClick={goToResults}
                  disabled={disableSubmit}
                >
                  Cerca corsi
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs text-gray-600 dark:text-body-color-dark">
              <div>✅ Dati ufficiali</div>
              <div>✅ Gratuito</div>
              <div>✅ Nessuno spam</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK PATHS */}
      <section className="container py-10 space-y-8">
        {/* Disciplines */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Esplora per disciplina</h2>
          <div className="flex flex-wrap gap-2">
            {topDisciplines.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                onClick={() => router.push(`/corsi?discipline=${d.value}`)}
              />
            ))}
            <button
              className="rounded-full border px-3 py-1 text-sm text-gray-600 hover:border-gray-400"
              onClick={() => router.push("/corsi")}
            >
              Vedi tutte →
            </button>
          </div>
        </div>

        {/* Cities */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Esplora per città</h2>
          <div className="flex flex-wrap gap-2">
            {topCities.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                onClick={() => router.push(`/corsi?location=${c.value}`)}
              />
            ))}
          </div>
        </div>

        {/* Universities */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Esplora per ateneo</h2>
          <div className="flex flex-wrap gap-2">
            {topUniversities.map((u) => (
              <Chip
                key={u.value}
                label={u.label}
                onClick={() => router.push(`/corsi?university=${u.value}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}