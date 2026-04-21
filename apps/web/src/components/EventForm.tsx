"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import { todayString } from "@/lib/dates";
import { COLOR_OPTIONS } from "@/lib/constants";
import type { EventColor } from "@/types";

const COLOR_LABELS: Record<EventColor, string> = {
  blue: "Blue",
  red: "Red",
  green: "Green",
  purple: "Purple",
  amber: "Amber",
};

export default function EventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addEvent } = useEvents();

  const prefillDate = searchParams.get("date") || todayString();
  const prefillTime = searchParams.get("time") || "09:00";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(prefillDate);
  const [startTime, setStartTime] = useState(prefillTime);
  const [endTime, setEndTime] = useState(
    `${((parseInt(prefillTime.split(":")[0]) + 1) % 24).toString().padStart(2, "0")}:00`
  );
  const [color, setColor] = useState<EventColor>("blue");
  const [errors, setErrors] = useState<string[]>([]);

  // Sync form state when URL search params change (e.g. clicking a different time slot)
  useEffect(() => {
    setDate(prefillDate);
    setStartTime(prefillTime);
    setEndTime(
      `${((parseInt(prefillTime.split(":")[0]) + 1) % 24).toString().padStart(2, "0")}:00`
    );
  }, [prefillDate, prefillTime]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!title.trim()) newErrors.push("Title is required");
    if (endTime === startTime) newErrors.push("End time must differ from start time");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    await addEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      color,
      completed: false,
    });

    router.push(`/day/${date}`);
  }

  const inputStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-width) solid var(--border-color-strong)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.length > 0 && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: "var(--event-red-bg)",
            color: "var(--event-red-text)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting with team..."
          className="w-full px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
          style={{
            ...inputStyle,
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "var(--accent-start)",
          }}
        />
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes..."
          rows={3}
          className="w-full px-4 py-3 text-sm outline-none resize-none transition-colors focus:ring-2"
          style={inputStyle}
        />
      </div>

      {/* Date */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
          style={inputStyle}
        />
      </div>

      {/* Time row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Color
        </label>
        <div className="flex gap-3">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
              style={{
                background: `var(--event-${c}-border)`,
                outline:
                  color === c
                    ? `3px solid var(--event-${c}-text)`
                    : "none",
                outlineOffset: "2px",
              }}
              title={COLOR_LABELS[c]}
            >
              {color === c && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
          borderRadius: "var(--radius-md)",
        }}
      >
        Create Event
      </button>
    </form>
  );
}
