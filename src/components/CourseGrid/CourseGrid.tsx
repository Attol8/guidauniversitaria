// src/components/CourseGrid/CourseGrid.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
  limit as fsLimit,
  orderBy,
  query as fsQuery,
  startAfter,
  where,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/../firebaseConfig";
import CourseCard from "@/components/CourseCard/CourseCard";
import type { SortKey } from "@/components/Courses/SearchFiltersBar";

type Course = { id: string; [k: string]: any };
type FilterProps = { discipline: string; location: string; university: string };

const PAGE_SIZE_DEFAULT = 24;
const MAX_AUTO_LOADS = 5;              // threshold
const OBSERVER_ROOT_MARGIN = "1200px"; // prefetch distance

export default function ResultsGrid({
  filters,
  query,
  sort = "name_asc",
  pageSize = PAGE_SIZE_DEFAULT,
}: {
  filters: FilterProps;
  query?: string;
  sort?: SortKey;
  pageSize?: number;
}) {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const autoLoadsRef = useRef(0);
  const pageIndexRef = useRef(0);

  const isSearchMode = !!(query && query.trim().length >= 2);

  const buildOrder = useCallback(() => {
    if (sort === "name_desc") return { field: "nomeCorso", dir: "desc" as const };
    if (sort === "uni_asc") return { field: "university.name", dir: "asc" as const };
    if (sort === "city_asc") return { field: "location.name", dir: "asc" as const };
    return { field: "nomeCorso", dir: "asc" as const };
  }, [sort]);

  const activeFiltersCount = useMemo(
    () => Number(!!filters.discipline) + Number(!!filters.location) + Number(!!filters.university),
    [filters],
  );

  const resetState = useCallback(() => {
    setItems([]);
    setLoading(true);
    setLoadingMore(false);
    setDone(false);
    setTotal(null);
    lastDocRef.current = null;
    autoLoadsRef.current = 0;
    pageIndexRef.current = 0;
  }, []);

  // Initial load whenever inputs change
  useEffect(() => {
    resetState();
    let alive = true;

    (async () => {
      try {
        if (isSearchMode) {
          const url = `/api/search?term=${encodeURIComponent(query!.trim())}`;
          const res = await fetch(url, { cache: "no-store" });
          const all: Course[] = await res.json();

          const filtered = all.filter((c) => {
            if (filters.discipline && c?.discipline?.id !== filters.discipline) return false;
            if (filters.location && c?.location?.id !== filters.location) return false;
            if (filters.university && c?.university?.id !== filters.university) return false;
            return true;
          });

          const sorted = (() => {
            if (sort === "name_desc") return [...filtered].sort((a, b) => (b?.nomeCorso || "").localeCompare(a?.nomeCorso || ""));
            if (sort === "uni_asc") return [...filtered].sort((a, b) => (a?.university?.name || "").localeCompare(b?.university?.name || ""));
            if (sort === "city_asc") return [...filtered].sort((a, b) => (a?.location?.name || "").localeCompare(b?.location?.name || ""));
            return [...filtered].sort((a, b) => (a?.nomeCorso || "").localeCompare(b?.nomeCorso || ""));
          })();

          if (!alive) return;
          setItems(sorted.slice(0, pageSize));
          setTotal(sorted.length);
          setDone(true); // search uses fixed window
          setLoading(false);
          emitViewList(sorted.slice(0, pageSize), 0);
          return;
        }

        const constraints: QueryConstraint[] = [];
        if (filters.discipline) constraints.push(where("discipline.id", "==", filters.discipline));
        if (filters.location) constraints.push(where("location.id", "==", filters.location));
        if (filters.university) constraints.push(where("university.id", "==", filters.university));

        const { field, dir } = buildOrder();
        constraints.push(orderBy(field as string, dir));
        constraints.push(fsLimit(pageSize));

        const baseRef = collection(db, "courses");

        try {
          const countSnap = await getCountFromServer(
            fsQuery(baseRef, ...(constraints.filter(c => (c as any).type !== "limit")))
          );
          if (alive) setTotal(countSnap.data().count);
        } catch { /* optional */ }

        const snap = await getDocs(fsQuery(baseRef, ...constraints));
        if (!alive) return;

        const next = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[];
        setItems(next);
        lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
        setDone(snap.empty || snap.docs.length < pageSize);
        setLoading(false);
        emitViewList(next, 0);
      } catch (err) {
        if (!alive) return;
        try {
          const baseRef = collection(db, "courses");
          const constraints: QueryConstraint[] = [];
          if (filters.discipline) constraints.push(where("discipline.id", "==", filters.discipline));
          if (filters.location) constraints.push(where("location.id", "==", filters.location));
          if (filters.university) constraints.push(where("university.id", "==", filters.university));
          constraints.push(orderBy("nomeCorso", "asc"));
          constraints.push(fsLimit(pageSize));
          const snap = await getDocs(fsQuery(baseRef, ...constraints));
          const next = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[];
          setItems(next);
          lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
          setDone(snap.empty || snap.docs.length < pageSize);
          emitViewList(next, 0);
        } finally {
          setLoading(false);
        }
      }
    })();

    return () => { alive = false; };
  }, [filters.discipline, filters.location, filters.university, query, sort, pageSize, buildOrder, isSearchMode, resetState]);

  const loadMore = useCallback(async () => {
    if (loadingMore || done || isSearchMode) return;
    setLoadingMore(true);
    try {
      const constraints: QueryConstraint[] = [];
      if (filters.discipline) constraints.push(where("discipline.id", "==", filters.discipline));
      if (filters.location) constraints.push(where("location.id", "==", filters.location));
      if (filters.university) constraints.push(where("university.id", "==", filters.university));

      const { field, dir } = buildOrder();
      constraints.push(orderBy(field as string, dir));
      if (lastDocRef.current) constraints.push(startAfter(lastDocRef.current));
      constraints.push(fsLimit(pageSize));

      const snap = await getDocs(fsQuery(collection(db, "courses"), ...constraints));
      const next = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[];

      setItems(prev => {
        const merged = [...prev, ...next];
        const pageIdx = Math.floor(prev.length / pageSize) + (next.length > 0 ? 1 : 0) - 1;
        if (next.length > 0 && pageIdx >= 0) emitViewList(next, pageIdx);
        return merged;
      });

      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setDone(snap.empty || snap.docs.length < pageSize);
    } catch {
      setDone(true);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, pageSize, loadingMore, done, buildOrder, isSearchMode]);

  // Auto-load via IntersectionObserver (thresholded)
  useEffect(() => {
    if (!sentinelRef.current || isSearchMode) return;
    const el = sentinelRef.current;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (done || loadingMore) return;
        if (autoLoadsRef.current >= MAX_AUTO_LOADS) return;
        autoLoadsRef.current += 1;
        void loadMore();
      }
    };

    const io = new IntersectionObserver(onIntersect, { root: null, rootMargin: OBSERVER_ROOT_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [done, loadingMore, isSearchMode, loadMore]);

  // Emit view_item_list per virtual page
  useEffect(() => {
    const pages = Math.ceil(items.length / pageSize);
    if (pages > pageIndexRef.current) pageIndexRef.current = pages;
  }, [items, pageSize]);

  const summary = useMemo(() => {
    if (loading && items.length === 0) return "Caricamento risultati…";
    const parts: string[] = [];
    if (isSearchMode) {
      parts.push(`Risultati per "${query?.trim()}"`);
      if (total !== null) parts.push(`• ${total} trovati`);
    } else {
      if (total !== null) parts.push(`${total} corsi`);
      if (activeFiltersCount > 0) parts.push(`• ${activeFiltersCount} filtri attivi`);
    }
    return parts.join(" ");
  }, [loading, items.length, isSearchMode, query, total, activeFiltersCount]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{summary}</h2>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white dark:bg-dark p-6 shadow">
          Nessun risultato. Prova a rimuovere qualche filtro o modifica la ricerca.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Sentinel for auto-load */}
          {!isSearchMode && !done && (
            <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
          )}

          {/* Fallback button and state */}
          {!isSearchMode && !done && (
            <div className="mt-6 flex justify-center">
              <button className="btn btn-primary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Caricamento…" : "Carica altri"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -------- analytics hook -------- */
function emitViewList(chunk: Course[], pageIndex: number) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("view_item_list", {
        detail: {
          page_index: pageIndex,
          item_ids: chunk.map((c) => c.id),
          item_count: chunk.length,
        },
      }),
    );
  } catch {
    /* noop */
  }
}