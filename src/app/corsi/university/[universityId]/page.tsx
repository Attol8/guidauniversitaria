"use client";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "../../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function UniversityCoursesPage() {
  const params = useParams();
  const universityId = params.universityId as string;
  const [universityName, setUniversityName] = useState<string>("");
  const [courseCount, setCourseCount] = useState<number>(0);

  useEffect(() => {
    async function fetchUniversityData() {
      if (universityId) {
        const universityDoc = doc(db, "universitys", universityId);
        const docSnapshot = await getDoc(universityDoc);

        if (docSnapshot.exists()) {
          const universityData = docSnapshot.data();
          setUniversityName(universityData.name || "");
          setCourseCount(universityData.coursesCounter || 0);
        }
      }
    }

    fetchUniversityData();
  }, [universityId]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>
          Corsi presso {universityName} | Trova il corso universitario perfetto per te
        </title>
        <meta
          name="description"
          content={`Trova corsi universitari presso ${universityName} basati sui tuoi interessi e bisogni.`}
        />
      </Head>
      <Breadcrumb
        pageName={`Corsi presso ${universityName}`}
        description={`${courseCount} risultati trovati`}
      />
      <div className="container mx-auto px-4 py-8">
        <CourseGrid filter={{ type: "university", id: universityId }} />
      </div>
    </section>
  );
}
