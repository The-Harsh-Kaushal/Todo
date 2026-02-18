import React, { useState } from "react";

function truncate(text, length = 40) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}

function getPriorityLabel(priority) {
  if (priority >= 4) return { label: "Immediate", color: "text-red-400" };
  if (priority === 3) return { label: "High", color: "text-orange-400" };
  if (priority === 2) return { label: "Medium", color: "text-yellow-400" };
  return { label: "Normal", color: "text-green-400" };
}

export default function TaskDisplayer({
  id,
  name,
  status,
  deadline,
  priority = 1,
  description,
  collaborators = [],
  onUpdate,
  onUpdateStatus,
  onAssignCollaborator, 
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");

  const [formData, setFormData] = useState({
    name,
    status,
    deadline,
    priority,
    description,
  });

  const priorityInfo = getPriorityLabel(priority);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(e) {
    e.stopPropagation();

    const updatedFields = {
      ...formData,
    };

    onUpdate(id, updatedFields);

    setEditing(false);
    setExpanded(false); // auto close after save
  }

  function handleAssignCollaborator(e) {
    e.preventDefault();

    if (!newCollaborator.trim()) return;

    onAssignCollaborator(id, newCollaborator.trim());
    setNewCollaborator("");
  }

  return (
    <div
      onClick={() => !editing && setExpanded(!expanded)}
      className="w-full 
                 border border-zinc-800
                 bg-zinc-950
                 rounded-sm
                 px-4 py-3 mb-3
                 hover:border-zinc-600 hover:bg-zinc-900
                 transition-all duration-200"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {truncate(name, 30)}
          </span>

          <div className="flex items-center gap-2 mt-1">
            {/* Status */}
            <select
              value={status ? "finished" : "unfinished"}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateStatus(id)}
              className={`text-[11px] uppercase tracking-wider font-medium 
    ${status ? "text-green-400" : "text-red-400"}
    bg-gray-900 border border-gray-700 px-1 py-0.5 rounded-sm
    outline-none cursor-pointer`}
            >
              <option value="unfinished">Unfinished</option>
              <option value="finished">Finished</option>
            </select>

            {/* Priority */}
            <span className={`text-[11px] ${priorityInfo.color}`}>
              • {priorityInfo.label}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end text-right min-w-[80px]">
          {deadline && (
            <span className="text-[11px] text-zinc-500">
              {deadline.toString().slice(0, 10)}
            </span>
          )}

          {/* Edit Button with Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing((prev) => !prev);
              setExpanded(true);
            }}
            className="flex items-center gap-1 text-[11px] mt-2 text-zinc-500 hover:text-white transition"
          >
            ✏ Edit
          </button>
        </div>
      </div>

      {/* Expanded */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[650px] mt-4" : "max-h-0"
        }`}
      >
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          {!editing ? (
            <>
              {/* Description */}
              {description && (
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Collaborators Section (always shown when expanded) */}
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <label className="text-zinc-500 text-xs font-semibold">
                  Collaborators
                </label>

                {/* List of collaborators */}
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {collaborators.length > 0 ? (
                    collaborators.map((col, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-sm"
                      >
                        {truncate(col.name, 18)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      No collaborators assigned
                    </span>
                  )}
                </div>

                {/* Add collaborator input */}
                <form
                  onSubmit={handleAssignCollaborator}
                  className="flex gap-2 mt-1"
                >
                  <input
                    type="text"
                    placeholder="Assign collaborator"
                    className="flex-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600 text-xs"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition rounded-sm"
                  >
                    ➕
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Edit Form */}
              <div className="space-y-3 text-sm">
                {/* Name */}
                <div>
                  <label className="text-zinc-500 text-xs">Task Name</label>
                  <input
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-zinc-500 text-xs">Deadline</label>
                  <input
                    type="date"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-zinc-500 text-xs">
                    Priority (1-4)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600"
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-zinc-500 text-xs">Description</label>
                  <textarea
                    rows={3}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-2 py-1 text-white outline-none focus:border-zinc-600 resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className="w-full py-1.5 mt-2 text-sm bg-zinc-800 hover:bg-zinc-700 transition text-white"
                >
                  ✔ Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
