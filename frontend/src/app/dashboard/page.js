"use client";

import React, { useEffect, useState } from "react";
import Displayer from "@/components/displayer";
import TaskDisplayer from "@/components/TaskDisplayer";
import CreateButton from "@/components/CreationButton";
import axios from "axios";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

export default function dashboard() {
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [listsOpen, setListsOpen] = useState(true);
  const [TasksOpen, setTasksOpen] = useState(true);
  const [activeBoard, setActiveBoard] = useState();
  const [activeList, setActiveList] = useState();
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  async function BoardCreation(payload) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/board/createboard`,
        {
          name: payload.name,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
  async function ListCreation(payload) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/list/addlist/${activeBoard}`,
        {
          list_name: payload.name,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      onClickBoard(activeBoard);
    } catch (error) {
      console.log(error);
    }
  }
  async function TaskCreation(payload) {
    try {
      console.log(activeList);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/addtask/${activeList}`,
        {
          task_name: payload.name,
          task_description: payload.description,
          task_deadline: payload.deadline,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      onClickList(activeList);
    } catch (error) {
      console.log(error);
    }
  }

  async function onClickBoard(id) {
    try {
      const lists = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/list/getlists/${id}`,
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      setActiveBoard(id);
      setLists(lists.data.lists);
    } catch (error) {
      console.log(error);
    }
  }
  async function onClickList(id) {
    try {
      const tasks = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/gettasks/${id}`,
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      setActiveList(id);
      setTasks(tasks.data);
    } catch (error) {
      console.log(error);
    }
  }
  async function onUpdate(id, payload) {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/updatetask/${id}`,
        {
          task_name: payload.name,
          task_description: payload.description,
          task_deadline: payload.deadline,
          task_priority: payload.priority,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      onClickList(activeList);
    } catch (error) {}
  }
  async function updateStatus(id) {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/changetaskstatus/${id}`,
        {},
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      setTasks(prev=>{
        return 
      })
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  }
  async function onAssignCollaborator(id, newCollaborator) {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/assigntask/${id}`,
        {
          email: newCollaborator,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      console.log(response);
      onClickList(activeList);
    } catch (error) {
      console.log(error);
    }
  }
  function getTaskPos(id, mode) {
    if (mode == "lists") return lists.findIndex((list) => list._id == id);
    if (mode == "tasks") return tasks.findIndex((task) => task._id == id);
  }
  async function handleDragEndList({ active, over }) {
    if (active.id == over.id) {
      onClickList(active.id);
      return;
    }
    const newPos = getTaskPos(over.id, "lists");
    const origPos = getTaskPos(active.id, "lists");
    let LB, TB;
    if (newPos > origPos) {
      LB = lists[newPos].order;
      TB = lists.length - 1 == newPos ? "" : lists[newPos + 1].order;
    } else {
      LB = newPos == 0 ? "" : lists[newPos - 1].order;
      TB = lists[newPos].order;
    }
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/list/changeorder/${active.id}`,
        {
          LB,
          TB,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      setLists((prev) => {
        return arrayMove(prev, origPos, newPos);
      });
    } catch (error) {}
  }
  async function handleDragEndTask({ active, over }) {
    if (active.id == over.id) return;
    const newPos = getTaskPos(over.id, "tasks");
    const oriPos = getTaskPos(active.id, "tasks");
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/changetaskorder/${active.id}`,
        {
          new_order: tasks[newPos].order,
        },
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
        },
      );
      setTasks((prev) => {
        return arrayMove(prev, oriPos, newPos);
      });
    } catch (error) {}
  }
  useEffect(() => {
    async function onLoad() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
          {
            headers: {
              Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
            },
          },
        );
        localStorage.setItem("user", ` ${response.data.user.email}`);

        const boards = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/board/boards`,
          {
            headers: {
              Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
            },
          },
        );
        setBoards(boards.data.boards);
      } catch (error) {
        console.log(error);
      }
    }
    onLoad();
  }, []);
  return (
    <div className="flex h-screen bg-black text-gray-200">
      {/* Boards */}
      <div
        className={`${
          boardsOpen ? "w-1/4" : "w-16"
        } border-r border-gray-800 flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div
          onClick={() => setBoardsOpen(!boardsOpen)}
          className={`border-b border-gray-800 bg-gray-950 cursor-pointer
      ${boardsOpen ? "px-4 py-4" : "flex-1 flex items-center justify-center"}`}
        >
          {boardsOpen ? (
            <div className="flex justify-between">
              <h2 className="text-sm uppercase tracking-widest text-gray-400">
                Boards
              </h2>
              <CreateButton onCreate={BoardCreation} type="board" />
            </div>
          ) : (
            <span
              className="text-gray-500 italic text-sm tracking-widest"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Boards
            </span>
          )}
        </div>

        {/* Content */}
        {boardsOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
            {boards.map((item, index) => (
              <div
                key={item._id}
                className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-md px-3 py-2 cursor-pointer"
              >
                <Displayer
                  id={item._id}
                  owner={item.owner.name}
                  name={item.name}
                  onClickHandler={onClickBoard}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lists */}

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
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
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
                    <Displayer
                      id={item._id}
                      owner={item.owner.name}
                      name={item.name}
                      onClickHandler={onClickList}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* tasks */}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
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
    </div>
  );
}
