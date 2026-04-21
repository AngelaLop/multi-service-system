"use client";

import { useEvents } from "@/hooks/useEvents";
import { usePomodoro } from "@/context/PomodoroContext";
import { formatTime, getEventPosition } from "@/lib/dates";
import type { PlannerEvent } from "@/types";

interface EventCardProps {
  event: PlannerEvent;
  compact?: boolean;
  onClick?: (event: PlannerEvent) => void;
}

export default function EventCard({ event, compact = false, onClick }: EventCardProps) {
  const { toggleComplete } = useEvents();
  const { state: pomo, dispatch: pomoDispatch } = usePomodoro();
  const { top, height } = getEventPosition(event.startTime, event.endTime);
  const isTimerActive = pomo.eventId === event.id;

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", event.id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick?.(event)}
      className="absolute left-1 right-1 overflow-hidden transition-opacity cursor-grab active:cursor-grabbing group"
      style={{
        top: `${top}%`,
        height: `${Math.max(height, 2)}%`,
        background: `var(--event-${event.color}-bg)`,
        borderLeft: `4px solid var(--event-${event.color}-border)`,
        borderRadius: "var(--radius-sm)",
        opacity: event.completed ? 0.5 : 1,
        zIndex: 10,
      }}
    >
      <div className={`flex items-start gap-1.5 ${compact ? "p-1" : "p-2"}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(event.id);
          }}
          className="w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
          style={{
            borderColor: `var(--event-${event.color}-border)`,
            background: event.completed
              ? `var(--event-${event.color}-border)`
              : "transparent",
          }}
        >
          {event.completed && (
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div
            className={`font-medium truncate ${compact ? "text-[10px]" : "text-xs"}`}
            style={{
              color: `var(--event-${event.color}-text)`,
              textDecoration: event.completed ? "line-through" : "none",
            }}
          >
            {event.title}
          </div>
          {!compact && (
            <div
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </div>
          )}
        </div>
        {/* Pomodoro trigger */}
        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isTimerActive) {
                pomoDispatch({ type: pomo.running ? "PAUSE" : "RESUME" });
              } else {
                pomoDispatch({ type: "START", payload: event.id });
              }
            }}
            className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-opacity ${
              isTimerActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            title={isTimerActive ? (pomo.running ? "Pause timer" : "Resume timer") : "Start focus timer"}
          >
            {isTimerActive && pomo.running ? (
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: "var(--accent-start)" }}
              />
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ color: "var(--accent-start)" }}>
                <path d="M2.5 1v10l8-5z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
