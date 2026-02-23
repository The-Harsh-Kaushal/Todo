import React, { useState } from "react";

export default function ListSearchBar({
  onSearch,
  value,
  setValue,
  operator,
  setOperator,
}) {
  const handleSubmit = () => {
    if (!value.trim()) return;

    onSearch?.({
      operator,
      value: value.trim(),
      page: 0
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full min-w-0 flex items-center gap-2">
      {/* Operator Dropdown */}
      <select
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        className="shrink-0 px-3 py-2
                   bg-zinc-900 border border-zinc-800
                   text-white text-sm
                   rounded-md
                   focus:outline-none focus:border-zinc-600"
      >
        <option value="eq">=</option>
        <option value="lt">&lt;</option>
        <option value="gt">&gt;</option>
        <option value="lte">&le;</option>
        <option value="gte">&ge;</option>
      </select>

      {/* Value Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter value..."
        className="flex-1 min-w-0 px-4 py-2
                   bg-zinc-900 border border-zinc-800
                   text-white text-sm
                   rounded-md
                   focus:outline-none focus:border-zinc-600
                   transition"
      />

      {/* Send Button */}
      <button
        onClick={handleSubmit}
        className="shrink-0 px-4 py-2
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
