"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, parseISO } from "date-fns";
import { usePlanner } from "@/hooks/usePlanner";
import { useEvents } from "@/hooks/useEvents";
import {
  formatDisplayDate,
  todayString,
  toDateString,
  getCompletionCounts,
} from "@/lib/dates";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import CompletionBar from "@/components/CompletionBar";
import EventModal from "@/components/EventModal";
import type { PlannerEvent } from "@/types";

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { dispatch } = usePlanner();
  const { events } = useEvents();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<PlannerEvent | null>(null);

  const dayEvents = events
    .filter((e) => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const { completed, total } = getCompletionCounts(events, date);

  function navigateDate(offset: number) {
    const current = parseISO(date);
    const next = addDays(current, offset);
    const dateStr = toDateString(next);
    dispatch({ type: "SET_DATE", payload: dateStr });
    router.push(`/day/${dateStr}`);
  }

  function goToday() {
    const today = todayString();
    dispatch({ type: "SET_DATE", payload: today });
    router.push(`/day/${today}`);
  }

  function handleSlotClick(time: string) {
    router.push(`/new?date=${date}&time=${time}`);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Custom header with date nav */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-medium rounded-lg transition-colors"
              style={{
                borderRadius: "var(--radius-sm)",
                border: "var(--border-width) solid var(--border-color-strong)",
                color: "var(--text-secondary)",
              }}
            >
              Today
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatDisplayDate(date)}
          </h1>
        </div>

        {total > 0 && (
          <div className="w-48">
            <CompletionBar completed={completed} total={total} size="sm" />
          </div>
        )}
      </header>

      {/* Time grid */}
      <div className="flex-1 overflow-auto p-4">
        <TimeSlotGrid
          events={dayEvents}
          date={date}
          onSlotClick={handleSlotClick}
          onEventClick={setSelectedEvent}
        />
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
