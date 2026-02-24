"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { arrayMove } from "@dnd-kit/sortable";

import BoardComponent from "@/components/BoardComponent";
import ListComponent from "@/components/ListComponent";
import TaskComponent from "@/components/TaskComponent";

export default function dashboard() {
  const [activeBoard, setActiveBoard] = useState();
  const [activeList, setActiveList] = useState();
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const listScrollStop = useRef(null);
  const taskScrollStop = useRef(null);
  const taskRef = useRef(null);

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
      setLists((prev) => [response.data.new_list, ...prev]);
    } catch (error) {
      console.log(error);
    }
  }
  async function TaskCreation(payload) {
    try {
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
  async function onClickList(id, offset, limit) {
    try {
      const tasks = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/gettasks/${id}`,
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
          params: {
            offset,
            limit,
          },
        },
      );
      setActiveList(id);
      taskScrollStop.current = {
        lastPayload: tasks.data.length,
      };
      if (offset && limit) {
        setTasks((prev) => {
          const exsisting_tasks = new Set(prev.map((b) => b._id));
          const filtered_tasks = tasks.data.filter(
            (b) => !exsisting_tasks.has(b._id),
          );
          return [...prev, ...filtered_tasks];
        });
      } else {
        setTasks(tasks.data);
      }
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
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, status: !task.status } : task,
        ),
      );
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
      setTasks((prev) => {
        return prev.map((item) => {
          return item._id == id
            ? {
                ...item,
                collabrators: [...item.collabrators, response.data.assignedTo],
              }
            : item;
        });
      });
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

  async function handlelistSearch({ operator, value, offset, limit }) {
    try {
      const lists = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/list/getlists/${activeBoard}`,
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
          params: {
            operator,
            value,
            offset,
            limit,
          },
        },
      );
      listScrollStop.current = {
        operator,
        value,
        lastPayload: lists.data.lists.length,
      };
      if (offset && limit) {
        setLists((prev) => {
          const exsisting_lists = new Set(prev.map((b) => b._id));
          const filtered_lists = lists.data.lists.filter(
            (b) => !exsisting_lists.has(b._id),
          );
          return [...prev, ...filtered_lists];
        });
      } else setLists(lists.data.lists);
    } catch (error) {
      console.log(error);
    }
  }
  async function handleTaskScroll() {
    if (!taskRef.current) return;
    const current_pos =
      taskRef.current.scrollTop + taskRef.current.clientHeight;
    if (current_pos >= taskRef.current.scrollHeight - 1) {
      const offset = tasks.length;
      const limit = Number(process.env.NEXT_PUBLIC_LIMIT);
      if (!taskScrollStop || taskScrollStop.lastPayload > 0)
        onClickList(activeBoard, offset, limit);
    }
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
      <BoardComponent
        boards={boards}
        setBoards={setBoards}
        onClickBoard={onClickBoard}
      />

      {/* Lists */}
      <ListComponent
        lists={lists}
        ListCreation={ListCreation}
        handlelistSearch={handlelistSearch}
        handleDragEndList={handleDragEndList}
        onClickList={onClickList}
        listStopScroll={listScrollStop}
      />
      {/* tasks */}
      <TaskComponent
        tasks={tasks}
        TaskCreation={TaskCreation}
        handleDragEndTask={handleDragEndTask}
        onUpdate={onUpdate}
        updateStatus={updateStatus}
        onAssignCollaborator={onAssignCollaborator}
        handleTaskScroll={handleTaskScroll}
        taskRef={taskRef}
      />
    </div>
  );
}
