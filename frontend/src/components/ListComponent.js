import React, { useState } from "react";
import CreateButton from "@/components/CreationButton";
import ListSearchBar from "@/components/ListSearchBar";
import ListDisplayer from "@/components/listdisplayer";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { closestCorners, DndContext } from "@dnd-kit/core";
export default function ListComponent({
  lists,
  ListCreation,
  handlelistSearch,
  handleDragEndList,
  onClickList,
}) {
  const [listsOpen, setListsOpen] = useState(true);

  return (
    <div
      className={`${
        listsOpen ? "w-1/4" : "w-16"
      } border-r border-gray-800 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div
        onClick={() => setListsOpen(!listsOpen)}
        className={`border-b border-gray-800 bg-gray-950 cursor-pointer
          ${listsOpen ? "px-4 py-4" : "flex-1 flex items-center justify-center"}`}
      >
        {listsOpen ? (
          <div className="flex justify-between">
            <h2 className="text-sm uppercase tracking-widest text-gray-400">
              Lists
            </h2>
            <CreateButton onCreate={ListCreation} type="list" />
          </div>
        ) : (
          <span
            className="text-gray-500 italic text-sm tracking-widest"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            Lists
          </span>
        )}
      </div>

      {/* Content */}
      {listsOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll flex flex-col">
          <ListSearchBar onSearch={handlelistSearch} />
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEndList}
          >
            <SortableContext
              items={lists.map((list) => list._id)}
              strategy={verticalListSortingStrategy}
            >
              {lists.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-md px-3 py-2 cursor-pointer"
                >
                  <ListDisplayer
                    id={item._id}
                    name={item.name}
                    taskCount={item.totalTasks}
                    finishedTasks={item.finishedTasks}
                    onClickHandler={onClickList}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
