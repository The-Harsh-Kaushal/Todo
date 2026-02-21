import React, { useState } from "react";

export default function Searchbar({ onSearch }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSearch?.(value);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="flex-1 px-4 py-2
                   bg-zinc-900 border border-zinc-800
                   text-white text-sm
                   rounded-md
                   focus:outline-none focus:border-zinc-600
                   transition"
      />

      <button
        onClick={handleSubmit}
        className="px-4 py-2
                   bg-zinc-800 border border-zinc-700
                   text-sm text-white
                   rounded-md
                   hover:bg-zinc-700
                   transition"
      >
        Send
      </button>
    </div>
  );
}