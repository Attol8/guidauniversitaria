// src/app/corsi/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResultsGrid from "@/components/CourseGrid/CourseGrid";
import SearchFiltersBar from "@/components/Courses/SearchFiltersBar";
import { type FiltersState, type SortKey } from "@/components/Courses/filterUtils";

function PageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncGuard = useRef(false);

  const initial: FiltersState = useMemo(
    () => ({
      q: searchParams.get("q") || "",
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
      q: searchParams.get("q") || "",
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
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.discipline) params.set("discipline", next.discipline);
    if (next.location) params.set("location", next.location);
    if (next.university) params.set("university", next.university);
    if (next.sort && next.sort !== "name_asc") params.set("sort", next.sort);
    router.replace(`/corsi${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [router]);

  return (
    <>
      {/* Sticky, compact, conversion-oriented filters */}
      <div className="sticky top-[calc(var(--header-h,64px))] z-30 bg-white/90 dark:bg-black/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="container py-3">
          <SearchFiltersBar initial={filters} onChange={apply} />
        </div>
      </div>

      {/* Results */}
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container px-4 py-6">
          <ResultsGrid
            filters={{
              discipline: filters.discipline,
              location: filters.location,
              university: filters.university,
            }}
            query={filters.q}
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