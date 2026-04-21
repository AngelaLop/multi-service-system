"use client";

import { useState } from "react";
import { addWeeks } from "date-fns";
import { formatWeekRange } from "@/lib/dates";
import WeekGrid from "@/components/WeekGrid";

export default function WeekPage() {
  const [baseDate, setBaseDate] = useState(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
              onClick={() => setBaseDate(addWeeks(baseDate, -1))}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setBaseDate(new Date())}
              className="px-3 py-1 text-xs font-medium rounded-lg transition-colors"
              style={{
                borderRadius: "var(--radius-sm)",
                border: "var(--border-width) solid var(--border-color-strong)",
                color: "var(--text-secondary)",
              }}
            >
              This Week
            </button>
            <button
              onClick={() => setBaseDate(addWeeks(baseDate, 1))}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatWeekRange(baseDate)}
          </h1>
        </div>
      </header>

      {/* Week grid */}
      <div className="flex-1 overflow-auto">
        <WeekGrid baseDate={baseDate} />
      </div>
    </div>
  );
}
