"use client";

import { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { todayString, formatTime } from "@/lib/dates";
import { parseQuickAdd } from "@/lib/nlp";
import { addDays, format } from "date-fns";

function getDateLabel(dateStr: string): string {
  const today = todayString();
  if (dateStr === today) return "Today";
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  if (dateStr === tomorrow) return "Tomorrow";
  return format(new Date(dateStr + "T12:00:00"), "EEE, MMM d");
}

export default function QuickAddTask() {
  const { addEvent } = useEvents();
  const [title, setTitle] = useState("");

  const parsed = useMemo(() => parseQuickAdd(title), [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eventTitle = parsed.title || title.trim();
    if (!eventTitle) return;

    await addEvent({
      title: eventTitle,
      description: "",
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      color: "blue",
      completed: false,
    });

    setTitle("");
  }

  const showPreview = title.trim().length > 0 && (parsed.hasDate || parsed.hasTime);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add a task... (e.g. Meet John tomorrow 3pm)"
          className="flex-1 px-3 py-2 text-xs outline-none transition-colors focus:ring-1"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "var(--border-width) solid var(--border-color)",
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "var(--accent-start)",
          }}
        />
        {title.trim() && (
          <button
            type="submit"
            className="px-3 py-2 text-xs font-medium text-white shrink-0 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
          >
            Add
          </button>
        )}
      </div>
      {showPreview && (
        <div className="mt-1 px-1 text-[11px]" style={{ color: "var(--accent-start)" }}>
          {getDateLabel(parsed.date)} at {formatTime(parsed.startTime)}
          {parsed.title ? ` — "${parsed.title}"` : ""}
        </div>
      )}
    </form>
  );
}
