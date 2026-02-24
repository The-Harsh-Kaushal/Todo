import React, { useRef, useState } from "react";
import CreateButton from "@/components/CreationButton";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskDisplayer from "@/components/TaskDisplayer";

export default function TaskComponent({
  tasks,
  TaskCreation,
  handleDragEndTask,
  onUpdate,
  updateStatus,
  onAssignCollaborator,
  handleTaskScroll,
  taskRef
}) {
  const [TasksOpen, setTasksOpen] = useState(true);
 
  return (
    <div
      className={`${
        TasksOpen ? "flex-1" : "w-16"
      } border-r border-gray-800 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div
        onClick={() => setTasksOpen(!TasksOpen)}
        className={`border-b border-gray-800 bg-gray-950 cursor-pointer
         ${TasksOpen ? "px-4 py-4" : "flex-1 flex items-center justify-center"}`}
      >
        {TasksOpen ? (
          <div className="flex justify-between">
            <h2 className="text-sm uppercase tracking-widest text-gray-400">
              Tasks
            </h2>
            <CreateButton onCreate={TaskCreation} />
          </div>
        ) : (
          <span
            className="text-gray-500 italic text-sm tracking-widest"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            Tasks
          </span>
        )}
      </div>

      {/* Content */}
      {TasksOpen && (
        <div 
        ref={taskRef}
        onScroll={handleTaskScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEndTask}
          >
            <SortableContext
              items={tasks.map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-md px-3 py-2 cursor-pointer"
                >
                  <TaskDisplayer
                    id={item._id}
                    name={item.name}
                    status={item.status}
                    deadline={item.deadline}
                    priority={item.priority}
                    description={item.description}
                    collaborators={item.collabrators}
                    onUpdate={onUpdate}
                    onUpdateStatus={updateStatus}
                    onAssignCollaborator={onAssignCollaborator}
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
