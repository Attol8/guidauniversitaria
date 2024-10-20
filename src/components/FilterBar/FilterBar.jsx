// components/FilterBar/FilterBar.jsx

"use client";
import { useState, useEffect } from "react";
import { getTopDisciplines } from "../getTopDisciplines";
import { getTopLocations } from "../getTopLocations";
import { getTopUniversities } from "../getTopUniversities";

export default function FilterBar({ onFilterChange, initialFilters }) {
  const [discipline, setDiscipline] = useState(initialFilters.discipline || "");
  const [location, setLocation] = useState(initialFilters.location || "");
  const [university, setUniversity] = useState(initialFilters.university || "");

  const [disciplineOptions, setDisciplineOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [universityOptions, setUniversityOptions] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    setDisciplineOptions(await getTopDisciplines());
    setLocationOptions(await getTopLocations());
    setUniversityOptions(await getTopUniversities());
  };

  useEffect(() => {
    onFilterChange({
      discipline,
      location,
      university,
    });
  }, [discipline, location, university]);

  return (
    <div>
      <div>
        <label>Discipline</label>
        <select value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
          <option value="">All</option>
          {disciplineOptions.map((option) => (
            <option key={option.docId} value={option.docId}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Location</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All</option>
          {locationOptions.map((option) => (
            <option key={option.docId} value={option.docId}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>University</label>
        <select value={university} onChange={(e) => setUniversity(e.target.value)}>
          <option value="">All</option>
          {universityOptions.map((option) => (
            <option key={option.docId} value={option.docId}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
