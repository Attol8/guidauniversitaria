"use client";
import { useState, useCallback } from 'react';
import Head from 'next/head';
import Breadcrumb from "@/components/Common/Breadcrumb";
import CourseCard from "@/components/CourseCard/CourseCard";
import CourseSearch from "@/components/CourseSearch/CourseSearch";

const TrovaCorsi = () => {
  const [filteredCourses, setFilteredCourses] = useState([]);

  const handleSearchResults = useCallback((results) => {
    setFilteredCourses(results);
  }, []);

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova Corsi | Find perfect university courses for you</title>
        <meta name="description" content="Search university courses based on your interests and needs." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Search university courses based on your interests and needs." />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <CourseSearch onResults={handleSearchResults} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrovaCorsi;