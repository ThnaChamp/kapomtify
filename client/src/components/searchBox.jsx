import React from 'react';

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SearchBox = ({ placeholder, value, onChange, onKeyDown }) => {
  return (
    <div className="relative">
      <SearchIcon />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-[#242424] border border-[#444] rounded-md py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-[#1DB954]"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default SearchBox;
