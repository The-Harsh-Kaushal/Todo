import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

function truncate(text, length = 22) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function ListDisplayer({
  name,
  id,
  onClickHandler,
  taskCount,
  finishedTasks
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const safeTaskCount = taskCount ?? 0;
  const safeFinished = finishedTasks ?? 0;

  const progress =
    safeTaskCount > 0
      ? Math.round((safeFinished / safeTaskCount) * 100)
      : 0;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => onClickHandler(id)}
      className="w-full max-w-md flex flex-col px-4 py-3 mb-3 border border-zinc-800 bg-zinc-950 rounded-sm hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-150"
    >
      {/* Top Row */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col min-w-0">
          {id && (
            <span className="text-[9px] text-zinc-700 tracking-widest">
              #{id.slice(-4)}
            </span>
          )}
        </div>

        <span className="text-sm font-semibold text-white truncate">
          {truncate(name, 30)}
        </span>
      </div>

      {/* Task Info */}
      <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
        <span>
          Tasks: {safeFinished}/{safeTaskCount}
        </span>
        <span>{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded mt-1 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}