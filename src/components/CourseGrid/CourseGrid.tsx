"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import CourseCard from "../CourseCard/CourseCard";

const CourseGrid = ({ filters }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      let q = collection(db, "courses");
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

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

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
