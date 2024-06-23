"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Head from 'next/head';
import Link from 'next/link';

const FAKE_COURSE_DATA = [
  {
    id: 1,
    name: 'Intro to Python',
    category: 'Technology',
    image: 'https://picsum.photos/seed/python/400/300', // Seed "python" ensures the same image is loaded each time
    description: 'Learn the basics of Python.'
  },
  {
    id: 2,
    name: 'Advanced React',
    category: 'Technology',
    image: 'https://picsum.photos/seed/react/400/300', // Seed "react" ensures the same image is loaded each time
    description: 'Deep dive into React and Next.js.'
  },
  {
    id: 3,
    name: 'Business Analytics',
    category: 'Business',
    image: 'https://picsum.photos/seed/business/400/300', // Seed "business" ensures the same image is loaded each time
    description: 'Understand core concepts in business analytics.'
  }
];

const TrovaCorsi = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, filter]);

  const fetchCourses = async () => {
    const filteredCourses = FAKE_COURSE_DATA.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter ? course.category === filter : true)
    );
    setCourses(filteredCourses);
  };

  return (
    <section className="bg-white dark:bg-gray-dark">
      <Head>
        <title>Trova Corsi | Trova corsi universitari perfetti per te</title>
        <meta name="description" content="Ricerca corsi universitari in base ai tuoi interessi e alle tue esigenze." />
      </Head>
      <Breadcrumb
        pageName="Trova Corsi"
        description="Ricerca corsi universitari in base ai tuoi interessi e alle tue esigenze."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search for courses..."
              className="p-2 border border-gray-300 rounded-md w-full focus:border-[#57572c] focus:outline-[#57572c]"
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-4 flex justify-between">
            <button
              className={`p-2 border ${filter === '' ? 'border-[#57572c] bg-[#3e763d] text-white' : 'border-gray-300 bg-white text-black'} rounded-md`}
              onClick={() => setFilter('')}
            >
              All
            </button>
            <button
              className={`p-2 border ${filter === 'Technology' ? 'border-[#57572c] bg-[#3e763d] text-white' : 'border-gray-300 bg-white text-black'} rounded-md mx-2`}
              onClick={() => setFilter('Technology')}
            >
              Technology
            </button>
            <button
              className={`p-2 border ${filter === 'Business' ? 'border-[#57572c] bg-[#3e763d] text-white' : 'border-gray-300 bg-white text-black'} rounded-md`}
              onClick={() => setFilter('Business')}
            >
              Business
            </button>
          </div>
          {/* {courses.map(course => (
            <div key={course.id} className="p-2 border-b border-gray-300">
              <h3 className="font-bold text-[#1a3d1f]">{course.name}</h3>
              <p className="text-black">{course.description}</p>
            </div>
          ))} */}

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white p-4 shadow rounded-lg border">
                  <img src={course.image} alt={course.name} className="w-full h-auto mb-4 rounded" />
                  <h3 className="font-bold text-[#1a3d1f]">{course.name}</h3>
                  <p className="text-black">{course.description}</p>
                  <Link href={`/courses/${course.id}`} className="text-blue-500 hover:text-blue-700">
                    Learn more
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrovaCorsi;
