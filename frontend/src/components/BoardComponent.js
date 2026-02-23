import React, { use, useEffect, useRef, useState } from "react";
import CreateButton from "@/components/CreationButton";
import Searchbar from "@/components/Searchbar";
import Displayer from "@/components/displayer";
import axios from "axios";

export default function BoardComponent({ boards, setBoards, onClickBoard }) {
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [value, setValue] = useState("");
  const scrollRef = useRef(null);
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
      setBoards((prev)=> [response.data.new_board,...prev]);
    } catch (error) {
      console.log(error);
    }
  }
  async function handleScroll() {

    if (!scrollRef.current) return;
    const current_pos =
      scrollRef.current.scrollTop + scrollRef.current.clientHeight;
    if (current_pos >= scrollRef.current.scrollHeight - 1) {
      const current_page = boards.length / 10;
      handleboardSearch(value, current_page);
    }
  }
  async function handleboardSearch(word, page) {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/board/boards`,
        {
          headers: {
            Authorization: `BEARER ${localStorage.getItem("accesstoken")}`,
          },
          params: {
            startswith: word,
            page,
          },
        },
      );
      const boardArray = response.data.boards;
      if (page && page > 0) {
        setBoards((prev) => {
          const exsisting_boards = new Set(prev.map(item => item._id));
          const filterred_board = boardArray.filter(item=> !exsisting_boards.has(item._id));
          return [...prev, ...filterred_board];
        });
      }
      else
      setBoards(boardArray);
    } catch (err) {
      console.log(err);
    }
  }

  return (
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
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll flex flex-col gap-3"
        >
          <Searchbar
            onSearch={handleboardSearch}
            value={value}
            setValue={setValue}
          />
          {boards.map((item, index) => (
            <div
              key={item._id}
              className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-md px-3 py-2 cursor-pointer"
            >
              <Displayer
                id={item._id}
                owner={item.ownerDetails.name}
                name={item.name}
                listCount={item.listcount}
                onClickHandler={onClickBoard}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
