"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { usePlanner } from "@/hooks/usePlanner";
import { useEvents } from "@/hooks/useEvents";
import { toDateString } from "@/lib/dates";
import { useRouter } from "next/navigation";

export default function MiniCalendar() {
  const { state, dispatch } = usePlanner();
  const { events } = useEvents();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedDate = new Date(state.selectedDate + "T00:00:00");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const hasEvents = (d: Date) =>
    events.some((e) => e.date === toDateString(d));

  function handleDayClick(d: Date) {
    const dateStr = toDateString(d);
    dispatch({ type: "SET_DATE", payload: dateStr });
    router.push(`/day/${dateStr}`);
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-[10px] py-1" style={{ color: "var(--text-tertiary)" }}>
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth);
          const selected = isSameDay(d, selectedDate);
          const today = isToday(d);
          const events = hasEvents(d);

          return (
            <button
              key={i}
              onClick={() => handleDayClick(d)}
              className="relative w-7 h-7 flex items-center justify-center text-[11px] rounded-full transition-colors"
              style={{
                color: !inMonth
                  ? "var(--text-tertiary)"
                  : selected
                  ? "white"
                  : "var(--text-primary)",
                background: selected
                  ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                  : today
                  ? "var(--bg-tertiary)"
                  : "transparent",
                fontWeight: today || selected ? 600 : 400,
              }}
            >
              {format(d, "d")}
              {events && !selected && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "var(--accent-start)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
