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
        <title>Find the Perfect University Course for You</title>
        <meta
          name="description"
          content="Discover university courses based on your interests and needs."
        />
      </Head>
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Breadcrumb
          pageName="Find Courses"
          description="Discover university courses based on your interests and needs."
        />
        <div className="container mx-auto px-4 py-8">
          <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
          <CourseGrid filters={filters} />
        </div>
      </section>
    </>
  );
}
