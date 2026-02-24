import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

export default function TaskComments({ taskId }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const containerRef = useRef(null);
  const firstLoadRef = useRef(false);

  // ===============================
  // FETCH COMMENTS
  // ===============================
  async function fetchComments(reset = false) {
    if (loading) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/getcomments/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
          params: {
            offset: comments ? comments.length : 0,
            limit,
          },
        },
      );

      const newComments = response.data.comments || [];

      if (reset) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }

      if (newComments.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // ADD COMMENT
  // ===============================
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/addcomment/${taskId}`,
        { comment: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      setComments((prev) => [...prev, resp.data]);
    } catch (err) {
      console.error(err);
    }
  }

  // ===============================
  // DELETE COMMENT
  // ===============================
  async function handleDelete(commentId, e) {
    e.stopPropagation();

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/task/deletecomment/${taskId}/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        },
      );

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  }

  function handleExpand(e) {
    e.stopPropagation();
    setExpanded((prev) => !prev);

    if (!firstLoadRef.current) {
      fetchComments(true);
      firstLoadRef.current = true;
    }
  }

  function handleScroll() {
    const container = containerRef.current;
    if (!container || loading || !hasMore) return;

    const isAtBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 5;

    if (isAtBottom) {
      fetchComments();
    }
  }

  useEffect(() => {
    setComments([]);
    setHasMore(true);
    firstLoadRef.current = false;
  }, [taskId]);

  return (
    <div className="border-t border-zinc-800 pt-4 mt-4">
      {/* Header */}
      <div
        onClick={handleExpand}
        className="flex items-center justify-between cursor-pointer text-sm font-semibold text-zinc-400 hover:text-white transition"
      >
        <span>Comments</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <>
          {/* 🔥 ADD COMMENT INPUT */}
          <form
            onSubmit={handleAddComment}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600 text-sm"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition rounded-sm"
            >
              Post
            </button>
          </form>

          {/* 🔥 COMMENT LIST */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="mt-3 max-h-72 overflow-y-auto space-y-3 pr-2 
                       scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
          >
            {comments.length === 0 && !loading && (
              <p className="text-xs text-zinc-500 italic">No comments yet.</p>
            )}

            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-zinc-900 border border-zinc-800 p-3 rounded-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-300">
                      {comment.ownerdetails?.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(comment.date)
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(comment._id, e)}
                    className="text-[10px] text-red-500 hover:text-red-400 transition"
                  >
                    ✖ Delete
                  </button>
                </div>

                <p className="text-sm text-zinc-400 break-words">
                  {comment.text}
                </p>
              </div>
            ))}

            {loading && (
              <p className="text-xs text-zinc-500 text-center">Loading...</p>
            )}

            {!hasMore && comments.length > 0 && (
              <p className="text-xs text-zinc-600 text-center">
                No more comments
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
