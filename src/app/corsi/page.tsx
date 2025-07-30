// pages/corsi/index.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import FilterBar from "@/components/FilterBar/FilterBar";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function CorsiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    discipline: searchParams.get("discipline") || "",
    location: searchParams.get("location") || "",
    university: searchParams.get("university") || "",
  });

  useEffect(() => {
    setFilters({
      discipline: searchParams.get("discipline") || "",
      location: searchParams.get("location") || "",
      university: searchParams.get("university") || "",
    });
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      }
    });

    router.push(`/corsi?${params.toString()}`);
  };

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
          <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
          <CourseGrid filters={filters} />
        </div>
      </section>
    </>
  );
}
