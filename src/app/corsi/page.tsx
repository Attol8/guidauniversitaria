// src/app/corsi/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResultsGrid from "@/components/CourseGrid/CourseGrid";
import SearchFiltersBar from "@/components/Courses/SearchFiltersBar";
export const dynamic = "force-dynamic";
import { hasActiveFilters, type FiltersState, type SortKey } from "@/components/Courses/filterUtils";

function PageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncGuard = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial: FiltersState = useMemo(
    () => ({
      discipline: searchParams.get("discipline") || "",
      location: searchParams.get("location") || "",
      university: searchParams.get("university") || "",
      sort: ((searchParams.get("sort") as SortKey) || "name_asc"),
    }),
    [searchParams],
  );

  const [filters, setFilters] = useState<FiltersState>(initial);

  // Sync URL -> state (avoid feedback loop)
  useEffect(() => {
    if (syncGuard.current) {
      syncGuard.current = false;
      return;
    }
    setFilters({
      discipline: searchParams.get("discipline") || "",
      location: searchParams.get("location") || "",
      university: searchParams.get("university") || "",
      sort: ((searchParams.get("sort") as SortKey) || "name_asc"),
    });
  }, [searchParams]);

  const apply = useCallback((next: FiltersState) => {
    syncGuard.current = true;
    setFilters(next);
    const params = new URLSearchParams();
    if (next.discipline) params.set("discipline", next.discipline);
    if (next.location) params.set("location", next.location);
    if (next.university) params.set("university", next.university);
    if (next.sort && next.sort !== "name_asc") params.set("sort", next.sort);
    router.replace(`/corsi${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [router]);

  return (
    <>
      {/* Desktop sticky filters */}
      <div className="hidden md:block sticky top-[calc(var(--header-h,64px))] z-30 bg-white/90 dark:bg-black/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="container py-3">
          <SearchFiltersBar initial={filters} onChange={apply} />
        </div>
      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-dark/95">
        <div className="container px-4 py-2 flex items-center justify-between gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
            Filtri
          </button>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {hasActiveFilters({ discipline: !!filters.discipline, location: !!filters.location, university: !!filters.university })
              ? "Filtri attivi"
              : "Tocca per filtrare"}
          </div>
        </div>
      </div>

      {/* Mobile filters modal */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white dark:bg-dark shadow-lg p-3 overflow-y-auto">
            <div className="flex items-center justify-between px-1 py-2">
              <span className="text-sm font-medium">Filtri</span>
              <button className="text-sm px-3 py-1 rounded-md border" onClick={() => setMobileOpen(false)}>Chiudi</button>
            </div>
            <div className="pt-1 pb-3">
              <SearchFiltersBar initial={filters} onChange={apply} />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container px-4 py-6">
          <ResultsGrid
            filters={{
              discipline: filters.discipline,
              location: filters.location,
              university: filters.university,
            }}
            sort={filters.sort}
            pageSize={24}
          />
        </div>
      </section>
    </>
  );
}

export default function CorsiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <PageInner />
    </Suspense>
  );
}