import React from "react";

function truncate(text, length = 22) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function AssignedListDisplayer({
  name = "Assigned Tasks",
  taskCount,
  finishedTasks,
  onClickHandler,
}) {
  const safeTaskCount = taskCount ?? 0;
  const safeFinished = finishedTasks ?? 0;

  const progress =
    safeTaskCount > 0 ? Math.round((safeFinished / safeTaskCount) * 100) : 0;

  return (
    <div
      onClick={() => onClickHandler(0)}
      className="w-full max-w-md flex flex-col px-4 py-3 mb-3 border border-cyan-700/60 bg-zinc-950 rounded-sm hover:border-cyan-400 hover:bg-zinc-900 transition-all duration-150 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-cyan-400">
          Assigned
        </span>
        <span className="text-sm font-semibold text-white truncate">
          {truncate(name, 30)}
        </span>
      </div>

      <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
        <span>
          Tasks: {safeFinished}/{safeTaskCount}
        </span>
        <span>{progress}%</span>
      </div>

      <div className="w-full h-1.5 bg-zinc-800 rounded mt-1 overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
