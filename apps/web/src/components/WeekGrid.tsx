"use client";

import Link from "next/link";
import { isToday } from "date-fns";
import { getWeekDays, toDateString, formatDayHeader, getCompletionCounts } from "@/lib/dates";
import { useEvents } from "@/hooks/useEvents";
import TimeSlotGrid from "./TimeSlotGrid";
import CompletionBar from "./CompletionBar";

interface WeekGridProps {
  baseDate: Date;
}

export default function WeekGrid({ baseDate }: WeekGridProps) {
  const { events } = useEvents();
  const days = getWeekDays(baseDate);

  return (
    <div className="flex flex-1 overflow-x-auto">
      {days.map((day) => {
        const dateStr = toDateString(day);
        const dayEvents = events.filter((e) => e.date === dateStr);
        const { completed, total } = getCompletionCounts(events, dateStr);
        const today = isToday(day);

        return (
          <div
            key={dateStr}
            className="flex flex-col min-w-[120px] flex-1 border-r"
            style={{ borderColor: "var(--border-color)" }}
          >
            {/* Day header */}
            <Link
              href={`/day/${dateStr}`}
              className="block px-2 py-2 border-b text-center transition-colors hover:bg-bg-tertiary"
              style={{
                borderColor: "var(--border-color)",
                background: today ? "var(--bg-tertiary)" : "transparent",
              }}
            >
              <div
                className="text-xs font-medium"
                style={{
                  color: today ? "var(--accent-start)" : "var(--text-primary)",
                }}
              >
                {formatDayHeader(day)}
              </div>
              {total > 0 && (
                <div className="mt-1 px-1">
                  <CompletionBar
                    completed={completed}
                    total={total}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              )}
            </Link>

            {/* Time grid for this day */}
            <div className="flex-1">
              <TimeSlotGrid
                events={dayEvents}
                date={dateStr}
                compact
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
