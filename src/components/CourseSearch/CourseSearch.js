import React, { useState, useCallback } from 'react';
import ReactSearchBox from 'react-search-box';
import _ from 'lodash';

const CourseSearch = ({ onResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchData, setSearchData] = useState([]);

  const fetchCourses = useCallback(async (term) => {
    try {
      console.log(term);
      const response = await fetch(`http://127.0.0.1:5001/guidauniversitaria/us-central1/search_courses?term=${encodeURIComponent(term)}`);
      
      const fetchedCourses = await response.json();
      
      // Format the data for ReactSearchBox
      const formattedCourses = fetchedCourses.map(course => ({
        key: course.id,
        value: course.nomeCorso,
        ...course
      }));
      
      setSearchData(formattedCourses);
      onResults(formattedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      onResults([]);
    }
  }, [onResults]);

  const debouncedFetchCourses = useCallback(_.debounce(fetchCourses, 300), [fetchCourses]);

  return (
    <div className="mb-6">
      <ReactSearchBox
        placeholder="Search for courses..."
        data={searchData}
        onChange={(value) => {
          setSearchTerm(value);
          debouncedFetchCourses(value);
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