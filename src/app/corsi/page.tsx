"use client";
import { useState } from 'react';
import Head from 'next/head';
import Breadcrumb from "@/components/Common/Breadcrumb";
import CourseCard from "@/components/CourseCard/CourseCard";
import CourseSearch from "@/components/CourseSearch/CourseSearch";

const TrovaCorsi = () => {
  const [filteredCourses, setfilteredCourses] = useState([]);

  const handleSearchResults = (results) => {
    setfilteredCourses(results);
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova Corsi | Find perfect university courses for you</title>
        <meta name="description" content="Search university courses based on your interests and needs." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Search university courses based on your interests and needs." />
      <div className="container mx-auto px-4 py-8">
        <CourseSearch onResults={handleSearchResults} searchData={filteredCourses} />
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-12 mt-4">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrovaCorsi;
