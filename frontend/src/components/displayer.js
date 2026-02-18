import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

function truncate(text, length = 22) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export default function Displayer({ name, owner, id, onClickHandler }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({id});
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={() => onClickHandler(id)}
      className="w-full max-w-md 
                    flex items-center justify-between gap-3
                    px-4 py-2.5 
                    mb-3
                    border border-zinc-800
                    bg-zinc-950
                    rounded-sm
                    hover:border-zinc-600 hover:bg-zinc-900
                    transition-all duration-150"
    >
      {/* Left Section (Owner + optional ID) */}
      <div className="flex flex-col min-w-0">
        {owner && (
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider truncate">
            {truncate(owner, 16)}
          </span>
        )}

        {id && (
          <span className="text-[9px] text-zinc-700 tracking-widest">
            #{id.slice(-4)}
          </span>
        )}
      </div>

      {/* Name (Main focus) */}
      <span className="text-sm font-semibold text-white truncate flex-1 text-right">
        {truncate(name, 30)}
      </span>
    </div>
  );
}
