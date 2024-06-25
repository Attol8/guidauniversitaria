"use client";
import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Common/Breadcrumb";
import Head from 'next/head';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { db } from 'firebaseConfig.js';

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
    <section className="bg-base-100 text-base-content">
      <Head>
        <title>Trova Corsi | Find perfect university courses for you</title>
        <meta name="description" content="Search university courses based on your interests and needs." />
      </Head>
      <Breadcrumb pageName="Trova Corsi" description="Search university courses based on your interests and needs." />
      <div className="container mx-auto px-4 py-8">
        <input
          type="text"
          placeholder="Search for courses..."
          className="input input-bordered input-primary w-full"
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {courses.map(course => (
            <div key={course.id} className="card card-bordered bg-base-100 shadow-xl relative">
              <button className="btn btn-ghost btn-circle absolute top-2 right-2 bg-white">
                <FontAwesomeIcon icon={farHeart} size="lg" />
              </button>
              <figure>
                <img src={course.image} alt={course.name} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{course.name}</h2>
                <p>{course.description}</p>
                <div className="card-actions justify-between">
                  <div className="text-sm font-semibold">
                    Acceptance Rate: <span className="badge badge-outline">{course.acceptanceRate}</span>
                  </div>
                  <div className="text-sm font-semibold">
                    Avg Net Price: <span className="badge badge-outline">{course.avgNetPrice}</span>
                  </div>
                </div>
                <div className="flex justify-between card-actions mt-2">
                  <Link href={`/courses/${course.id}`} className="btn btn-primary">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrovaCorsi;



