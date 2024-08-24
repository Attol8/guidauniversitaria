"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseCard from "@/components/CourseCard/CourseCard";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

interface Course {
  id: string;
  discipline?: string;
  // Add any other fields that your courses have
}

async function fetchCourses(disciplineId?: string): Promise<Course[]> {
  const coursesRef = collection(db, "courses");
  let q;

  // if (disciplineId && provincia) {
  //   q = query(
  //     coursesRef,
  //     where("discipline.id", "==", disciplineId),
  //     where("provincia", "==", provincia),
  //     limit(20)
  //   );
  // } else if (disciplineId) {
  //   q = query(coursesRef, where("discipline.id", "==", disciplineId), limit(20));
  // } else if (provincia) {
  //   q = query(coursesRef, where("provincia", "==", provincia), limit(20));
  // } else {
  //   q = query(coursesRef, limit(20)); // Fetch random 20 courses if no filters
  // }

  if (disciplineId) {
    q = query(coursesRef, where("discipline.id", "==", disciplineId), limit(20));
  }
  else {
    q = query(coursesRef, limit(20)); // Fetch random 20 courses if no filters
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Course;
    return { id: doc.id, ...data };
  });
}

export default function CourseGrid() {
  const params = useParams()
  const disciplineId = params.discipline as string;
  console.log("disciplineId", disciplineId);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function getCourses() {
      const courses = await fetchCourses(disciplineId);
      setCourses(courses);
    }

    getCourses();
  }, [disciplineId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {courses.length > 0 ? (
        courses.map((course) => <CourseCard key={course.id} course={course} />)
      ) : (
        <p>No courses found</p>
      )}
    </div>
  );
}
