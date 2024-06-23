"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Head from 'next/head';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

const FAKE_COURSE_DATA = [
  {
    id: 1,
    name: 'Intro to Python',
    category: 'Technology',
    image: 'https://picsum.photos/seed/python/500/300',
    description: 'Learn the basics of Python.',
    acceptanceRate: '85%',
    avgNetPrice: '$2,000'
  },
  {
    id: 2,
    name: 'Advanced React',
    category: 'Technology',
    image: 'https://picsum.photos/seed/react/500/300',
    description: 'Deep dive into React and Next.js.',
    acceptanceRate: '60%',
    avgNetPrice: '$2,500'
  },
  {
    id: 3,
    name: 'Business Analytics',
    category: 'Business',
    image: 'https://picsum.photos/seed/business/500/300',
    description: 'Understand core concepts in business analytics.',
    acceptanceRate: '75%',
    avgNetPrice: '$3,000'
  }
];

const TrovaCorsi = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const filteredCourses = FAKE_COURSE_DATA.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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
            <div key={course.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative">
                <img src={course.image} alt={course.name} className="w-full h-auto object-cover" />
                <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500">
                  <FontAwesomeIcon icon={farHeart} size="lg" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{course.name}</h3>
                <div className="text-sm text-gray-700">{course.description}</div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold">Acceptance Rate: {course.acceptanceRate}</span>
                  <span className="text-sm font-semibold">Avg Net Price: {course.avgNetPrice}</span>
                </div>
                <Link href={`/courses/${course.id}`} className="text-indigo-600 hover:text-indigo-800 mt-4 block text-sm">
                  Learn more
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrovaCorsi;
