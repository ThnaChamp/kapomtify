import React from 'react';

const SearchBox = ({ placeholder, value, onChange, onKeyDown }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-48 focus:outline-none focus:border-[#1DB954]"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
};

export default SearchBox;
