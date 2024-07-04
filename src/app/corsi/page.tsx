"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Breadcrumb from "@/components/Common/Breadcrumb";
import { db } from 'firebaseConfig';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import CourseCard from "@/components/CourseCard/CourseCard";  // Import the CourseCard component

const TrovaCorsi = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const q = query(coursesCollection, limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filteredCourses = courses.filter(course =>
      course.nomeCorso.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter ? course.category === filter : true)
    );
    setCourses(filteredCourses);
  }, [searchTerm, filter]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <Head>
        <title>Trova Corsi | Find perfect university courses for you</title>
        <meta name="description" content="Search university courses based on your interests and needs." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Search university courses based on your interests and needs." />
      <div className="container mx-auto px-4 py-8">
        <input
          type="text"
          placeholder="Search for courses..."
          className="p-2 border border-gray-300 rounded-md w-full focus:border-blue-500 focus:outline-none"
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />  // Use CourseCard here
          ))}
        </div>
      </div>
    </section >
  );
};

export default TrovaCorsi;
