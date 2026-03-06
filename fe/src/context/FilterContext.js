'use client';

import React, { createContext, useState, useContext } from 'react';

// 1. Tạo Context
const FilterContext = createContext();

// 2. Tạo một custom Hook để sử dụng Context dễ dàng hơn
export const useFilters = () => useContext(FilterContext);

// 3. Tạo Provider Component
export const FilterProvider = ({ children }) => {
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState('Tất cả'); // New state for question type

  // Giá trị sẽ được chia sẻ cho các component con
  const value = {
    selectedGrade,
    setSelectedGrade,
    selectedSubject,
    setSelectedSubject,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedType,      // Expose new state
    setSelectedType,   // Expose new setter
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
