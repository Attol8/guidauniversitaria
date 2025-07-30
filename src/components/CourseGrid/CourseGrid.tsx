"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, CollectionReference, Query, DocumentData } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import CourseCard from "../CourseCard/CourseCard";

interface Course {
  id: string;
  [key: string]: any;
}

interface FilterProps {
  discipline: string;
  location: string;
  university: string;
}

interface CourseGridProps {
  filters: FilterProps;
}

const CourseGrid = ({ filters }: CourseGridProps) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      const coursesRef = collection(db, "courses");
      const constraints = [];

      if (filters.discipline) {
        constraints.push(where("discipline.id", "==", filters.discipline));
      }
      if (filters.location) {
        constraints.push(where("location.id", "==", filters.location));
      }
      if (filters.university) {
        constraints.push(where("university.id", "==", filters.university));
      }

      const q: Query<DocumentData> | CollectionReference<DocumentData> = constraints.length > 0 
        ? query(coursesRef, ...constraints)
        : coursesRef;

      try {
        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchCourses();
  }, [filters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseGrid;
