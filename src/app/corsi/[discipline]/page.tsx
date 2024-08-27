"use client";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function CorsiPage() {
  const params = useParams();
  const disciplineId = params.discipline as string;
  const [disciplineName, setDisciplineName] = useState<string>("");
  const [courseCount, setCourseCount] = useState<number>(0);

  useEffect(() => {
    async function fetchDisciplineData() {
      if (disciplineId) {
        const disciplineDoc = doc(db, "disciplines", disciplineId);
        const docSnapshot = await getDoc(disciplineDoc);

        if (docSnapshot.exists()) {
          const disciplineData = docSnapshot.data();
          setDisciplineName(disciplineData.name || "");
          setCourseCount(disciplineData.coursesCounter || 0);
        }
      }
    }

    fetchDisciplineData();
  }, [disciplineId]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Corsi in {disciplineName} | Trova il corso universitario perfetto per te</title>
        <meta
          name="description"
          content={`Trova corsi universitari in ${disciplineName} basati sui tuoi interessi e bisogni.`}
        />
      </Head>
      <Breadcrumb
        pageName={`Corsi in ${disciplineName}`}
        description={`${courseCount} risultati trovati`}
      />
      <div className="container mx-auto px-4 py-8">
        <CourseGrid />
      </div>
    </section>
  );
}
