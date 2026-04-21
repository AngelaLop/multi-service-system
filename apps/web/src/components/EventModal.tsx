"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { formatTime } from "@/lib/dates";
import { COLOR_OPTIONS } from "@/lib/constants";
import type { PlannerEvent, EventColor } from "@/types";

interface EventModalProps {
  event: PlannerEvent;
  onClose: () => void;
}

const COLOR_LABELS: Record<EventColor, string> = {
  blue: "Blue",
  red: "Red",
  green: "Green",
  purple: "Purple",
  amber: "Amber",
};

export default function EventModal({ event, onClose }: EventModalProps) {
  const { updateEvent, deleteEvent, toggleComplete } = useEvents();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [color, setColor] = useState<EventColor>(event.color);

  async function handleSave() {
    if (!title.trim()) return;
    await updateEvent({ ...event, title: title.trim(), description: description.trim(), startTime, endTime, color });
    onClose();
  }

  async function handleDelete() {
    await deleteEvent(event.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-5"
        style={{
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          /* Edit mode */
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "var(--border-width) solid var(--border-color)",
              }}
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              rows={2}
              className="w-full px-3 py-2 text-sm outline-none resize-none"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "var(--border-width) solid var(--border-color)",
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "var(--border-width) solid var(--border-color)",
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "var(--border-width) solid var(--border-color)",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: `var(--event-${c}-border)`,
                    outline: color === c ? `2px solid var(--event-${c}-text)` : "none",
                    outlineOffset: "2px",
                  }}
                  title={COLOR_LABELS[c]}
                >
                  {color === c && (
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 text-xs font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View mode */
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    textDecoration: event.completed ? "line-through" : "none",
                  }}
                >
                  {event.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {event.date} · {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </p>
                {event.description && (
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    {event.description}
                  </p>
                )}
              </div>
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-2"
                style={{ background: `var(--event-${event.color}-border)` }}
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-2 text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
              >
                Edit
              </button>
              <button
                onClick={() => toggleComplete(event.id)}
                className="flex-1 py-2 text-xs font-medium"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                {event.completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-medium"
                style={{ background: "var(--event-red-bg)", color: "var(--event-red-text)" }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
