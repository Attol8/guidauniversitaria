// components/FilterBar/FilterBar.jsx

"use client";
import { useState, useEffect } from "react";
import { getTopDisciplines } from "../getTopDisciplines";
import { getTopLocations } from "../getTopLocations";
import { getTopUniversities } from "../getTopUniversities";
import { FaGraduationCap, FaMapMarkerAlt, FaUniversity, FaTimesCircle } from "react-icons/fa";
import Select from "react-select";

export default function FilterBar({ onFilterChange, initialFilters }) {
  const [discipline, setDiscipline] = useState(initialFilters.discipline || null);
  const [location, setLocation] = useState(initialFilters.location || null);
  const [university, setUniversity] = useState(initialFilters.university || null);

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
      discipline: discipline?.value || "",
      location: location?.value || "",
      university: university?.value || "",
    });
  }, [discipline, location, university]);

  const clearFilters = () => {
    setDiscipline(null);
    setLocation(null);
    setUniversity(null);
  };

  return (
    <div className="w-full p-6 bg-white shadow-md rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Filter Courses</h2>
        <button
          onClick={clearFilters}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <FaTimesCircle className="mr-1" /> Clear Filters
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Discipline Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaGraduationCap className="inline-block mr-2 text-xl" /> Discipline
          </label>
          <Select
            value={discipline}
            onChange={setDiscipline}
            options={disciplineOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            placeholder="Select Discipline"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaMapMarkerAlt className="inline-block mr-2 text-xl" /> Location
          </label>
          <Select
            value={location}
            onChange={setLocation}
            options={locationOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            placeholder="Select Location"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* University Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaUniversity className="inline-block mr-2 text-xl" /> University
          </label>
          <Select
            value={university}
            onChange={setUniversity}
            options={universityOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            placeholder="Select University"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>
    </div>
  );
}
