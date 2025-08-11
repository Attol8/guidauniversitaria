// src/components/Courses/SearchFiltersBar.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select, { SingleValue } from "react-select";
import { getTopDisciplines } from "@/components/getTopDisciplines";
import { getTopLocations } from "@/components/getTopLocations";
import { getTopUniversities } from "@/components/getTopUniversities";
import { encodeFilters, hasActiveFilters, type SortKey, type FiltersState } from "./filterUtils";

export type { SortKey, FiltersState };

type Opt = { value: string; label: string };

export default function SearchFiltersBar({
  initial,
  onChange,
}: {
  initial: FiltersState;
  onChange: (next: FiltersState) => void;
}) {
  const [q, setQ] = useState(initial.q || "");
  const [discipline, setDiscipline] = useState<Opt | null>(null);
  const [location, setLocation] = useState<Opt | null>(null);
  const [university, setUniversity] = useState<Opt | null>(null);
  const [sort, setSort] = useState<SortKey>(initial.sort || "name_asc");

  const [discOpts, setDiscOpts] = useState<Opt[]>([]);
  const [locOpts, setLocOpts] = useState<Opt[]>([]);
  const [uniOpts, setUniOpts] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);

  const mounted = useRef(false);
  const debTimer = useRef<NodeJS.Timeout | null>(null);

  // Load options once
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [d, l, u] = await Promise.all([getTopDisciplines(24), getTopLocations(24), getTopUniversities(24)]);
        if (!alive) return;
        setDiscOpts(d.map(x => ({ value: x.docId, label: x.title })));
        setLocOpts(l.map(x => ({ value: x.docId, label: x.title })));
        setUniOpts(u.map(x => ({ value: x.docId, label: x.title })));

        // hydrate initial selecteds
        if (initial.discipline) {
          const m = d.find(z => z.docId === initial.discipline);
          if (m) setDiscipline({ value: m.docId, label: m.title });
        }
        if (initial.location) {
          const m = l.find(z => z.docId === initial.location);
          if (m) setLocation({ value: m.docId, label: m.title });
        }
        if (initial.university) {
          const m = u.find(z => z.docId === initial.university);
          if (m) setUniversity({ value: m.docId, label: m.title });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect external changes (URL -> initial)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setQ(initial.q || "");
    setSort(initial.sort || "name_asc");
    // discipline/location/university are hydrated by options effect; leave as-is here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.sort]);

  const emit = useCallback((immediate = false) => {
    const next = {
      q: q.trim(),
      discipline: discipline?.value || "",
      location: location?.value || "",
      university: university?.value || "",
      sort,
    } satisfies FiltersState;

    if (immediate) {
      onChange(next);
      return;
    }
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => onChange(next), 250);
  }, [q, discipline, location, university, sort, onChange]);

  // Wire value changes
  useEffect(() => { emit(false); }, [q, discipline, location, university, sort, emit]);

  const clearAll = () => {
    setQ("");
    setDiscipline(null);
    setLocation(null);
    setUniversity(null);
    setSort("name_asc");
    emit(true);
  };

  const active = useMemo(
    () => ({
      q: q.trim(),
      discipline: discipline?.label || "",
      location: location?.label || "",
      university: university?.label || "",
    }),
    [q, discipline, location, university],
  );

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "name_asc", label: "Corso (A→Z)" },
    { value: "name_desc", label: "Corso (Z→A)" },
    { value: "uni_asc", label: "Ateneo (A→Z)" },
    { value: "city_asc", label: "Città (A→Z)" },
  ];

  return (
    <div className="rounded-xl bg-white/95 dark:bg-dark/95 shadow-md p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-white">Ricerca</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca per nome corso…"
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Discipline */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-white">Disciplina</label>
          <Select
            isLoading={loading}
            isClearable
            value={discipline}
            onChange={(v: SingleValue<Opt>) => setDiscipline(v)}
            options={discOpts}
            classNamePrefix="react-select"
            placeholder={loading ? "Caricamento…" : "Seleziona"}
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-white">Città</label>
          <Select
            isLoading={loading}
            isClearable
            value={location}
            onChange={(v: SingleValue<Opt>) => setLocation(v)}
            options={locOpts}
            classNamePrefix="react-select"
            placeholder={loading ? "Caricamento…" : "Seleziona"}
          />
        </div>

        {/* University */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-white">Ateneo</label>
          <Select
            isLoading={loading}
            isClearable
            value={university}
            onChange={(v: SingleValue<Opt>) => setUniversity(v)}
            options={uniOpts}
            classNamePrefix="react-select"
            placeholder={loading ? "Caricamento…" : "Seleziona"}
          />
        </div>

        {/* Sort + Clear */}
        <div className="md:col-span-2 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-white">Ordina</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={clearAll}
            className="h-9 mt-auto whitespace-nowrap rounded-md border px-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Pulisci
          </button>
        </div>
      </div>

      {/* Active chips */}
      {hasActiveFilters({ q: active.q, discipline: !!active.discipline, location: !!active.location, university: !!active.university }) && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {active.q && <Chip label={`Testo: "${active.q}"`} onClear={() => setQ("")} />}
          {active.discipline && <Chip label={`Disciplina: ${active.discipline}`} onClear={() => setDiscipline(null)} />}
          {active.location && <Chip label={`Città: ${active.location}`} onClear={() => setLocation(null)} />}
          {active.university && <Chip label={`Ateneo: ${active.university}`} onClear={() => setUniversity(null)} />}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
      {label}
      <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" aria-label="clear" onClick={onClear}>
        ×
      </button>
    </span>
  );
}