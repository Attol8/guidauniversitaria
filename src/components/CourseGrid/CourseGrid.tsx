"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import CourseCard from "../CourseCard/CourseCard";

const CourseGrid = ({ filter }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      let q;
      if (filter && filter.type && filter.id) {
        q = query(
          collection(db, "courses"),
          where(`${filter.type}.id`, "==", filter.id)
        );
      } else {
        q = collection(db, "courses");
      }

      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map((doc) => doc.data());
      setCourses(coursesData);
    }

    fetchCourses();
  }, [filter]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseGrid;
