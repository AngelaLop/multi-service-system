"use client";

import { useRouter } from "next/navigation";
import { addDays, parseISO } from "date-fns";
import { usePlanner } from "@/hooks/usePlanner";
import { formatDisplayDate, todayString, toDateString } from "@/lib/dates";

interface HeaderProps {
  title?: string;
  showDateNav?: boolean;
}

export default function Header({ title, showDateNav = false }: HeaderProps) {
  const { state, dispatch } = usePlanner();
  const router = useRouter();

  function navigateDate(offset: number) {
    const current = parseISO(state.selectedDate);
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

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-4">
        {showDateNav && (
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
        )}
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {title || formatDisplayDate(state.selectedDate)}
        </h1>
      </div>
    </header>
  );
}
