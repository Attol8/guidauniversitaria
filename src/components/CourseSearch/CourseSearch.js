import React, { useState, useEffect, useCallback } from 'react';
import ReactSearchBox from 'react-search-box';
import _ from 'lodash';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { db } from 'firebaseConfig';

const CourseSearch = ({ onResults, searchData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = useCallback(async (term) => {
    try {
      const coursesRef = collection(db, 'courses');
      let coursesQuery;

      if (term && term.length > 0) {
        coursesQuery = query(
          coursesRef,
          where('nomeCorso', '>=', term),
          where('nomeCorso', '<=', term + '\uf8ff'),
          limit(20)
        );
      } else {
        // If no search term or search term is less than 3 characters, load the first 20 courses
        coursesQuery = query(coursesRef, limit(20));
      }

      const querySnapshot = await getDocs(coursesQuery);
      let fetchedCourses = querySnapshot.docs.map(doc => {
        return {
          id: doc.id,
          value: doc.data().nomeCorso, // This is the text that will be displayed in the search box dropdown
          ...doc.data()
        };
      });

      onResults(fetchedCourses); // Pass the results to the parent component
    } catch (error) {
      console.error("Error fetching courses:", error);
      onResults([]); // In case of error, return an empty array
    }
  }, [onResults]);

  const debouncedFetchCourses = useCallback(_.debounce(fetchCourses, 500), [fetchCourses]);

  useEffect(() => {
    debouncedFetchCourses(searchTerm);
  }, [searchTerm, debouncedFetchCourses]);

  return (
    <div className="mb-6">
      <ReactSearchBox
        placeholder="Search for courses..."
        data={searchData} // Use filtered search data
        onChange={(value) => {
          setSearchTerm(value);
        }}
        fuseConfigs={{
          threshold: 0.3,
        }}
        value={searchTerm}
      />
    </div>
  );
};

export default CourseSearch;
