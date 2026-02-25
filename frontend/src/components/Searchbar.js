import React, { useRef, useState } from "react";

export default function Searchbar({ onSearch, value, setValue }) {
  const debounce = useRef(null);

  const handleOnChange = (e) => {
    setValue(e.target.value);
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
    debounce.current = setTimeout(() => {
      onSearch(e.target.value);
    },300);
  };

  return (
    <div className="w-full max-w-md flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => handleOnChange(e)}
        placeholder="Search..."
        className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-md focus:outline-none focus:border-zinc-600 transition"
      />
    </div>
  );
}
