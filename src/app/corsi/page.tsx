// pages/corsi/index.jsx

"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import FilterBar from "@/components/FilterBar/FilterBar";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";

function CorsiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdatingURL = useRef(false);

  const [filters, setFilters] = useState({
    discipline: searchParams.get("discipline") || "",
    location: searchParams.get("location") || "",
    university: searchParams.get("university") || "",
  });

  // Only update filters from URL if we're not currently updating the URL
  useEffect(() => {
    if (!isUpdatingURL.current) {
      const newFilters = {
        discipline: searchParams.get("discipline") || "",
        location: searchParams.get("location") || "",
        university: searchParams.get("university") || "",
      };
      
      setFilters(prevFilters => {
        // Only update if filters actually changed
        if (JSON.stringify(newFilters) !== JSON.stringify(prevFilters)) {
          return newFilters;
        }
        return prevFilters;
      });
    }
    isUpdatingURL.current = false;
  }, [searchParams]);

  const handleFilterChange = useCallback((newFilters: {
    discipline: string;
    location: string;
    university: string;
  }) => {
    // Prevent URL update loop
    isUpdatingURL.current = true;
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key as keyof typeof newFilters]) {
        params.set(key, newFilters[key as keyof typeof newFilters]);
      }
    });

    const newURL = `/corsi${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL, { scroll: false });
  }, [router]);

  return (
    <>
      <Head>
        <title>Trova il corso perfetto per te!</title>
        <meta
          name="description"
          content="Trova corsi universitari in base ai tuoi interessi e alle tue esigenze."
        />
      </Head>
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Breadcrumb
          pageName="Trova Corsi"
          description="Trova corsi universitari in base ai tuoi interessi e alle tue esigenze."
        />
        <div className="container mx-auto px-4 py-8">
          <FilterBar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters}
          />
          <CourseGrid filters={filters} />
        </div>
      </section>
    </>
  );
}

export default function CorsiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CorsiPageContent />
    </Suspense>
  );
}
