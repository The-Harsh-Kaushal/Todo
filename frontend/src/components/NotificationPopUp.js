import { useMemo, useState } from "react";

function getTimeAgo(createdAt) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";

  const diffMs = Math.max(Date.now() - created, 0);
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export default function NotificationPopUp({
  id,
  title,
  message,
  read,
  createdAt,
  onOpen,
}) {
  const [expanded, setExpanded] = useState(false);
  const timeAgo = useMemo(() => getTimeAgo(createdAt), [createdAt]);

  const handleOpen = () => {
    setExpanded((prev) => !prev);
    if (!read && onOpen) onOpen(id);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`w-full rounded-xl border p-3 text-left transition ${
        read
          ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"
          : "border-cyan-600/70 bg-cyan-950/30 hover:bg-cyan-950/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-sm font-semibold ${
            read ? "text-zinc-200" : "text-cyan-200"
          }`}
        >
          {title}
        </h3>
        <span className="shrink-0 text-[11px] text-zinc-400">{timeAgo}</span>
      </div>

      {expanded && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">{message}</p>
      )}
    </button>
  );
}
