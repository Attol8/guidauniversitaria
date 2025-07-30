// components/FilterBar/FilterBar.tsx

"use client";
import { useState, useEffect, useCallback } from "react";
import { getTopDisciplines } from "../getTopDisciplines";
import { getTopLocations } from "../getTopLocations";
import { getTopUniversities } from "../getTopUniversities";
import { FaGraduationCap, FaMapMarkerAlt, FaUniversity, FaTimesCircle } from "react-icons/fa";
import Select, { SingleValue } from "react-select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterData {
  id: number;
  docId: string;
  title: string;
  path: string;
  newTab: boolean;
}

interface FilterBarProps {
  onFilterChange: (filters: {
    discipline: string;
    location: string;
    university: string;
  }) => void;
  initialFilters: {
    discipline: string;
    location: string;
    university: string;
  };
}

export default function FilterBar({ onFilterChange, initialFilters }: FilterBarProps) {
  const [discipline, setDiscipline] = useState<FilterOption | null>(null);
  const [location, setLocation] = useState<FilterOption | null>(null);
  const [university, setUniversity] = useState<FilterOption | null>(null);

  const [disciplineOptions, setDisciplineOptions] = useState<FilterData[]>([]);
  const [locationOptions, setLocationOptions] = useState<FilterData[]>([]);
  const [universityOptions, setUniversityOptions] = useState<FilterData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);

  const fetchFilterOptions = useCallback(async () => {
    // Only fetch if we haven't loaded data yet
    if (hasLoadedData) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const [disciplines, locations, universities] = await Promise.all([
        getTopDisciplines(),
        getTopLocations(), 
        getTopUniversities()
      ]);
      setDisciplineOptions(disciplines);
      setLocationOptions(locations);
      setUniversityOptions(universities);
      setHasLoadedData(true);
      
    } catch (err) {
      setError('Failed to load filter options. Please try again.');
      console.error('Error fetching filter options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoadedData]);

  // Separate effect to set initial values after data is loaded
  useEffect(() => {
    if (!hasLoadedData || disciplineOptions.length === 0) return;
    
    // Set initial values after options are loaded
    if (initialFilters.discipline && disciplineOptions.length > 0) {
      const selectedDiscipline = disciplineOptions.find(d => d.docId === initialFilters.discipline);
      if (selectedDiscipline) {
        setDiscipline({ value: selectedDiscipline.docId, label: selectedDiscipline.title });
      }
    }
    if (initialFilters.location && locationOptions.length > 0) {
      const selectedLocation = locationOptions.find(l => l.docId === initialFilters.location);
      if (selectedLocation) {
        setLocation({ value: selectedLocation.docId, label: selectedLocation.title });
      }
    }
    if (initialFilters.university && universityOptions.length > 0) {
      const selectedUniversity = universityOptions.find(u => u.docId === initialFilters.university);
      if (selectedUniversity) {
        setUniversity({ value: selectedUniversity.docId, label: selectedUniversity.title });
      }
    }
    
    // Mark as initialized after setting initial values
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [hasLoadedData, disciplineOptions, locationOptions, universityOptions, initialFilters, isInitialized]);

  useEffect(() => {
    fetchFilterOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Debounced filter change handler - only after initial load
  useEffect(() => {
    if (!isInitialized) return; // Don't trigger on initial load
    
    const timeoutId = setTimeout(() => {
      onFilterChange({
        discipline: discipline?.value || "",
        location: location?.value || "",
        university: university?.value || "",
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [discipline, location, university, onFilterChange, isInitialized]);

  const clearFilters = () => {
    setDiscipline(null);
    setLocation(null);
    setUniversity(null);
  };

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
        <div className="text-red-800 text-center">
          <p className="font-semibold">Error loading filters</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchFilterOptions}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white shadow-md rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Filter Courses</h2>
        <button
          onClick={clearFilters}
          className="flex items-center text-red-600 hover:text-red-800"
          disabled={isLoading}
        >
          <FaTimesCircle className="mr-1" /> Clear Filters
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {/* Discipline Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaGraduationCap className="inline-block mr-2 text-xl" /> Discipline
          </label>
          <Select
            value={discipline}
            onChange={(newValue: SingleValue<FilterOption>) => setDiscipline(newValue)}
            options={disciplineOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            isLoading={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Discipline"}
            className="react-select-container"
            classNamePrefix="react-select"
            isDisabled={isLoading}
          />
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaMapMarkerAlt className="inline-block mr-2 text-xl" /> Location
          </label>
          <Select
            value={location}
            onChange={(newValue: SingleValue<FilterOption>) => setLocation(newValue)}
            options={locationOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            isLoading={isLoading}
            placeholder={isLoading ? "Loading..." : "Select Location"}
            className="react-select-container"
            classNamePrefix="react-select"
            isDisabled={isLoading}
          />
        </div>

        {/* University Filter */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            <FaUniversity className="inline-block mr-2 text-xl" /> University
          </label>
          <Select
            value={university}
            onChange={(newValue: SingleValue<FilterOption>) => setUniversity(newValue)}
            options={universityOptions.map((option) => ({
              value: option.docId,
              label: option.title,
            }))}
            isClearable
            isLoading={isLoading}
            placeholder={isLoading ? "Loading..." : "Select University"}
            className="react-select-container"
            classNamePrefix="react-select"
            isDisabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
