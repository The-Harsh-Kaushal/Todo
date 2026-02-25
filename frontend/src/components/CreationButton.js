import React, { useState } from "react";

export default function CreateButton({ type = "task", onCreate  }) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    const payload = {
      name: formData.name,
    };

    if (type === "task") {
      payload.description = formData.description;
      payload.deadline = formData.deadline;
    }

    onCreate(payload);

    // reset
    setFormData({
      name: "",
      description: "",
      deadline: "",
    });

    setOpen(false);
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-white hover:bg-zinc-800 hover:border-zinc-600 transition rounded-sm"
      >
        + Create {type}
      </button>

      {/* Popup Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-md p-6 space-y-4 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-white capitalize">
              Create {type}
            </h2>

            {/* Name */}
            <div>
              <label className="text-xs text-zinc-500">Name</label>
              <input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-zinc-600"
              />
            </div>

            {/* Only for Task */}
            {type === "task" && (
              <>
                <div>
                  <label className="text-xs text-zinc-500">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-zinc-600 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-zinc-600"
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
