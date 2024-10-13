"use client";
import CourseGrid from "@/components/CourseGrid/CourseGrid";
import Head from "next/head";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "../../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function LocationCoursesPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const [locationName, setLocationName] = useState<string>("");
  const [courseCount, setCourseCount] = useState<number>(0);

  useEffect(() => {
    async function fetchLocationData() {
      if (locationId) {
        const locationDoc = doc(db, "locations", locationId);
        const docSnapshot = await getDoc(locationDoc);

        if (docSnapshot.exists()) {
          const locationData = docSnapshot.data();
          setLocationName(locationData.name || "");
          setCourseCount(locationData.coursesCounter || 0);
        }
      }
    }

    fetchLocationData();
  }, [locationId]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>
          Corsi a {locationName} | Trova il corso universitario perfetto per te
        </title>
        <meta
          name="description"
          content={`Trova corsi universitari a ${locationName} basati sui tuoi interessi e bisogni.`}
        />
      </Head>
      <Breadcrumb
        pageName={`Corsi a ${locationName}`}
        description={`${courseCount} risultati trovati`}
      />
      <div className="container mx-auto px-4 py-8">
        <CourseGrid filter={{ type: "location", id: locationId }} />
      </div>
    </section>
  );
}
