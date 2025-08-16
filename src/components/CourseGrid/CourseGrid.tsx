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
import LoadMore from "@/components/Common/LoadMore";
import { trackViewItemList, buildListName } from "@/lib/analytics";
import type { SortKey } from "@/components/Courses/SearchFiltersBar";

type Course = { id: string; nomeCorso: string; discipline: { id: string; name: string }; location: { id: string; name: string }; university: { id: string; name: string }; [k: string]: any };
type FilterProps = { discipline: string; location: string; university: string };

const PAGE_SIZE_DEFAULT = 24;
const MAX_AUTO_LOADS = 5;              // threshold
const OBSERVER_ROOT_MARGIN = "1200px"; // prefetch distance

export default function ResultsGrid({
  filters,
  sort = "name_asc",
  pageSize = PAGE_SIZE_DEFAULT,
}: {
  filters: FilterProps;
  sort?: SortKey;
  pageSize?: number;
}) {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [seenIds] = useState(() => new Set<string>());

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const autoLoadsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSearchMode = false;

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
    setCurrentPage(1);
    seenIds.clear();
    lastDocRef.current = null;
    autoLoadsRef.current = 0;
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [seenIds]);

  // Initial load whenever inputs change
  useEffect(() => {
    resetState();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    (async () => {
      try {
        let alive = true;
        signal.addEventListener('abort', () => { alive = false; });

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
        if (signal.aborted) return;

        const next = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[];
        
        // Add to seen IDs to prevent duplicates
        next.forEach(course => seenIds.add(course.id));
        
        setItems(next);
        lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
        setDone(snap.empty || snap.docs.length < pageSize);
        setLoading(false);
        
        // Emit analytics event for first page
        emitAnalyticsEvent(next, 1);
      } catch (err) {
        if (signal.aborted) return;
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
          
          // Add to seen IDs to prevent duplicates
          next.forEach(course => seenIds.add(course.id));
          
          setItems(next);
          lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
          setDone(snap.empty || snap.docs.length < pageSize);
          
          // Emit analytics event for first page
          emitAnalyticsEvent(next, 1);
        } finally {
          setLoading(false);
        }
      }
    })();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.discipline, filters.location, filters.university, sort, pageSize, buildOrder, isSearchMode, resetState]);

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
      const rawNext = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[];
      
      // Filter out duplicates using seenIds
      const next = rawNext.filter(course => !seenIds.has(course.id));
      next.forEach(course => seenIds.add(course.id));

      setItems(prev => {
        const merged = [...prev, ...next];
        return merged;
      });
      
      // Emit analytics for the new page
      if (next.length > 0) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        emitAnalyticsEvent(next, nextPage);
      }

      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setDone(snap.empty || snap.docs.length < pageSize);
    } catch {
      setDone(true);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, pageSize, loadingMore, done, buildOrder, isSearchMode, currentPage, seenIds]);

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

  // Analytics event emitter
  const emitAnalyticsEvent = useCallback((courses: Course[], page: number) => {
    try {
      const listName = buildListName({
        discipline: filters.discipline,
        location: filters.location,
        university: filters.university,
      });
      
      trackViewItemList({
        list_id: "course_search_results",
        list_name: listName,
        page,
        items: courses.map((course, index) => ({
          item_id: course.id,
          item_name: course.nomeCorso || "Course",
          item_category: course.discipline?.name || "Corso",
          index: (page - 1) * pageSize + index,
        })),
      });
    } catch (error) {
      console.debug("Analytics event failed:", error);
    }
  }, [filters.discipline, filters.location, filters.university, pageSize]);

  const summary = useMemo(() => {
    if (loading && items.length === 0) return "Caricamento risultati…";
    const parts: string[] = [];
    if (total !== null) parts.push(`${total} corsi`);
    if (activeFiltersCount > 0) parts.push(`• ${activeFiltersCount} filtri attivi`);
    return parts.join(" ");
  }, [loading, items.length, total, activeFiltersCount]);

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

          {/* Load More Button */}
          {!isSearchMode && (
            <div className="mt-6">
              <LoadMore
                onLoadMore={loadMore}
                isLoading={loadingMore}
                hasMore={!done}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

