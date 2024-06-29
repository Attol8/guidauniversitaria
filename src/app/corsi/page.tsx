"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Head from 'next/head';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { db } from 'firebaseConfig';
import { collection, query, getDocs, limit } from 'firebase/firestore';

const TrovaCorsi = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, 'courses');
        const q = query(coursesCollection, limit(10));
        console.log(q);
        const querySnapshot = await getDocs(q);
        const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(fetchedCourses);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white shadow-lg rounded-lg overflow-hidden relative flex flex-col">
              <div className="relative">
                <img src={course.image} alt={course.nomeCorso} className="w-full h-auto object-cover" />
                <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500">
                  <FontAwesomeIcon icon={farHeart} size="lg" />
                </button>
              </div>
              <div className="p-4 pb-12">
                <h3 className="font-bold text-xl mb-2">{course.nomeCorso}</h3>
                <div className="text-sm text-gray-700">{course.sede?.comuneDescrizione || 'No description available'}</div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold">Starting Year: {course.anno?.descrizione || 'N/A'}</span>
                  <span className="text-sm font-semibold">Language: {course.lingua || 'N/A'}</span>
                </div>
              </div>
              <Link href={`/courses/${course.id}`} className="btn btn-primary btn-outline btn-sm mt-auto mb-4 mx-8">
                Learn more

              </Link>
            </div>
          ))}
        </div>
      </div>
    </section >
  );
};

export default TrovaCorsi;
