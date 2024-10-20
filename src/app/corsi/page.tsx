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
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova il corso universitario perfetto per te</title>
        <meta
          name="description"
          content="Trova corsi universitari basati sui tuoi interessi e bisogni."
        />
      </Head>
      <Breadcrumb
        pageName="Trova Corsi"
        description="Trova corsi universitari basati sui tuoi interessi e bisogni."
      />
      <div className="container mx-auto px-4 py-8">
        <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
        <CourseGrid filters={filters} />
      </div>
    </section>
  );
}
