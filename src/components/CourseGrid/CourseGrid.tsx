import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseCard from "@/components/CourseCard/CourseCard";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

interface Course {
  id: string;
  discipline?: string;
  province?: string;
  startingYear?: string;
  language?: string;
}

async function fetchCourses(filters: { disciplineId?: string; province?: string }): Promise<Course[]> {
  const coursesRef = collection(db, "courses");
  let q;

  if (filters.disciplineId && filters.province) {
    q = query(
      coursesRef,
      where("discipline.id", "==", filters.disciplineId),
      where("province", "==", filters.province),
      limit(20)
    );
  } else if (filters.disciplineId) {
    q = query(coursesRef, where("discipline.id", "==", filters.disciplineId), limit(20));
  } else if (filters.province) {
    q = query(coursesRef, where("province", "==", filters.province), limit(20));
  } else {
    q = query(coursesRef, limit(20)); // Fetch random 20 courses if no filters
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Course;
    return { id: doc.id, ...data };
  });
}

export default function CourseGrid() {
  const params = useParams();
  const disciplineId = params.discipline as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [province, setProvince] = useState<string | undefined>(undefined); // New state for province filter
  const [disciplineFilter, setDisciplineFilter] = useState<string | undefined>(disciplineId);

  // Fetch courses when filters change
  useEffect(() => {
    async function getCourses() {
      const courses = await fetchCourses({ disciplineId: disciplineFilter, province });
      setCourses(courses);
    }

    getCourses();
  }, [disciplineFilter, province]);

  return (
    <div>
      <div className="filters mb-8">
        {/* Discipline Filter */}
        <select
          value={disciplineFilter || ""}
          onChange={(e) => setDisciplineFilter(e.target.value || undefined)}
          className="border rounded p-2 mr-4"
        >
          <option value="">All Disciplines</option>
          <option value="science">Science</option>
          <option value="arts">Arts</option>
          {/* Add more discipline options */}
        </select>

        {/* Province Filter */}
        <select
          value={province || ""}
          onChange={(e) => setProvince(e.target.value || undefined)}
          className="border rounded p-2 mr-4"
        >
          <option value="">All Provinces</option>
          <option value="Milan">Milan</option>
          <option value="Rome">Rome</option>
          {/* Add more province options */}
        </select>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        ) : (
          <p>No courses found</p>
        )}
      </div>
    </div>
  );
}
