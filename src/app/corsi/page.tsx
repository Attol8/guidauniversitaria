"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Head from 'next/head';
import Link from 'next/link';

const FAKE_COURSE_DATA = [
  { id: 1, name: 'Intro to Python', category: 'Technology', description: 'Learn the basics of Python.' },
  { id: 2, name: 'Advanced React', category: 'Technology', description: 'Deep dive into React and Next.js.' },
  { id: 3, name: 'Business Analytics', category: 'Business', description: 'Understand core concepts in business analytics.' }
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
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) && course.category.includes(filter)
    );
    setCourses(filteredCourses);
  };

  return (
    <>
      <Head>
        <title>Trova Corsi | Trova corsi universitari perfetti per te</title>
        <meta name="description" content="Ricerca corsi universitari in base ai tuoi interessi e alle tue esigenze." />
      </Head>
      <Breadcrumb
        pageName="Trova Corsi"
        description="Ricerca corsi universitari in base ai tuoi interessi e alle tue esigenze."
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto"> {/* Adjust this width to match Breadcrumb's container */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search for courses..."
              className="p-2 border border-gray-300 rounded-md w-full"
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-4 flex justify-between">
            <button
              className={`p-2 border ${filter === '' ? 'border-blue-500' : 'border-gray-300'} rounded-md`}
              onClick={() => setFilter('')}
            >
              All
            </button>
            <button
              className={`p-2 border ${filter === 'Technology' ? 'border-blue-500' : 'border-gray-300'} rounded-md mx-2`}
              onClick={() => setFilter('Technology')}
            >
              Technology
            </button>
            <button
              className={`p-2 border ${filter === 'Business' ? 'border-blue-500' : 'border-gray-300'} rounded-md`}
              onClick={() => setFilter('Business')}
            >
              Business
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          {courses.map(course => (
            <div key={course.id} className="p-2 border-b border-gray-300">
              <h3 className="font-bold">{course.name}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TrovaCorsi;
