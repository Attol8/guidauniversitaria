"use client";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function DisciplinePage() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova Corsi | Find perfect university courses for you</title>
        <meta name="description" content="Search university courses based on your interests and needs." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Search university courses based on your interests and needs." />
      <div className="container mx-auto px-4 py-8">
        <CourseGrid />
      </div>
    </section>
  );
}