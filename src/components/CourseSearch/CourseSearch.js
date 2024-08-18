import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';

const CourseSearch = ({ onResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchCourses = useCallback(async (term) => {
    if (!term) {
      setSuggestions([]);
      onResults([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001/guidauniversitaria/us-central1/search_courses?term=${encodeURIComponent(term)}`);
      
      const fetchedCourses = await response.json();
      
      setSuggestions(fetchedCourses.map(course => course.nomeCorso));
      onResults(fetchedCourses);

    } catch (error) {
      console.error("Error fetching courses:", error);
      onResults([]);
    }
  }, [onResults]);

  const debouncedFetchCourses = useCallback(_.debounce(fetchCourses, 300), [fetchCourses]);

  useEffect(() => {
    debouncedFetchCourses(searchTerm);
    
    // Cleanup function to cancel the debounce on unmount
    return () => debouncedFetchCourses.cancel();
  }, [searchTerm, debouncedFetchCourses]);

  return (
    <div className="form-control w-full max-w-xs">
      <div className="dropdown w-full">
        <input
          type="text"
          placeholder="Search for courses..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full mt-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <a onClick={() => setSearchTerm(suggestion)}>{suggestion}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseSearch;