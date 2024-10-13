"use client";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function CorsiPage() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova il corso universitario perfetto per te</title>
        <meta name="description" content="Trova corsi universitari basati sui tuoi interessi e bisogni." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Trova corsi universitari basati sui tuoi interessi e bisogni." />
      <div className="container mx-auto px-4 py-8">
        <CourseGrid filter={null} />
      </div>
    </section>
  );
}




