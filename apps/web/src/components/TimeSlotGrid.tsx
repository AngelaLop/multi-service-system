"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TIME_SLOTS, GRID_START_HOUR, GRID_TOTAL_MINUTES } from "@/lib/constants";
import { formatTime, minutesToTime, timeToMinutes } from "@/lib/dates";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "./EventCard";
import type { PlannerEvent } from "@/types";

interface TimeSlotGridProps {
  events: PlannerEvent[];
  date: string;
  onSlotClick?: (time: string) => void;
  onEventClick?: (event: PlannerEvent) => void;
  compact?: boolean;
}

function snapTo15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

export default function TimeSlotGrid({
  events,
  date,
  onSlotClick,
  onEventClick,
  compact = false,
}: TimeSlotGridProps) {
  const { events: allEvents, updateEvent } = useEvents();
  const gridRef = useRef<HTMLDivElement>(null);
  const [dropPreviewPercent, setDropPreviewPercent] = useState<number | null>(null);

  // Current time indicator — computed client-side only to avoid SSR timezone mismatch
  const [currentTimePercent, setCurrentTimePercent] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
      if (date !== todayStr) {
        setCurrentTimePercent(null);
        return;
      }
      const minutes = now.getHours() * 60 + now.getMinutes() - GRID_START_HOUR * 60;
      const pct = (minutes / GRID_TOTAL_MINUTES) * 100;
      setCurrentTimePercent(pct >= 0 && pct <= 100 ? pct : null);
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [date]);

  const showCurrentTime = currentTimePercent !== null;

  const getMinutesFromY = useCallback((clientY: number): number => {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const pct = relativeY / rect.height;
    const minutesFromStart = pct * GRID_TOTAL_MINUTES;
    return snapTo15(GRID_START_HOUR * 60 + minutesFromStart);
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const minutes = getMinutesFromY(e.clientY);
    const snappedFromStart = minutes - GRID_START_HOUR * 60;
    const pct = (snappedFromStart / GRID_TOTAL_MINUTES) * 100;
    setDropPreviewPercent(Math.max(0, Math.min(100, pct)));
  }

  function handleDragLeave() {
    setDropPreviewPercent(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDropPreviewPercent(null);
    const eventId = e.dataTransfer.getData("text/plain");
    if (!eventId) return;

    const event = allEvents.find((ev) => ev.id === eventId);
    if (!event) return;

    const duration = timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
    const newStartMinutes = getMinutesFromY(e.clientY);
    const newEndMinutes = newStartMinutes + duration;

    updateEvent({
      ...event,
      date,
      startTime: minutesToTime(newStartMinutes),
      endTime: minutesToTime(newEndMinutes),
    });
  }

  return (
    <div className="relative flex flex-1">
      {/* Time labels */}
      <div className={`shrink-0 ${compact ? "w-8" : "w-16"}`}>
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot}
            className={`${compact ? "h-8 text-[8px]" : "h-14 text-xs"} flex items-start justify-end pr-2`}
            style={{ color: "var(--text-tertiary)" }}
          >
            <span className="-translate-y-2">
              {compact ? slot.split(":")[0] : formatTime(slot)}
            </span>
          </div>
        ))}
      </div>

      {/* Grid area */}
      <div
        ref={gridRef}
        className="flex-1 relative border-l"
        style={{ borderColor: "var(--border-color)" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hour rows */}
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot}
            className={`${compact ? "h-8" : "h-14"} border-b cursor-pointer transition-colors hover:bg-bg-tertiary`}
            style={{ borderColor: "var(--border-color)" }}
            onClick={() => onSlotClick?.(slot)}
          />
        ))}

        {/* Drop preview */}
        {dropPreviewPercent !== null && (
          <div
            className="absolute left-0 right-0 h-14 z-5 pointer-events-none"
            style={{
              top: `${dropPreviewPercent}%`,
              background: "var(--accent-start)",
              opacity: 0.15,
            }}
          />
        )}

        {/* Current time indicator */}
        {showCurrentTime && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePercent}%` }}
          >
            <div className="flex items-center">
              <div
                className="w-2.5 h-2.5 rounded-full -ml-1.5"
                style={{ background: "var(--accent-start)" }}
              />
              <div
                className="flex-1 h-0.5"
                style={{ background: "var(--accent-start)" }}
              />
            </div>
          </div>
        )}

        {/* Event cards */}
        {events.map((event) => (
          <EventCard key={event.id} event={event} compact={compact} onClick={onEventClick} />
        ))}
      </div>
    </div>
  );
}
