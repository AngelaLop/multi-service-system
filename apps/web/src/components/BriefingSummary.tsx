"use client";

import { useEffect, useState } from "react";
import { timeToMinutes } from "@/lib/dates";
import type { PlannerEvent } from "@/types";

interface BriefingSummaryProps {
  events: PlannerEvent[];
}

export default function BriefingSummary({ events }: BriefingSummaryProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    setNow(d.getHours() * 60 + d.getMinutes());
    const id = setInterval(() => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const total = events.length;
  const completed = events.filter((e) => e.completed).length;
  const overdue = events.filter(
    (e) => !e.completed && timeToMinutes(e.endTime) < now
  ).length;

  let message: string;
  if (total === 0) {
    message = "All clear — no tasks scheduled for today";
  } else if (completed === total) {
    message = `All ${total} tasks completed. Nice work.`;
  } else {
    const parts = [`You have ${total} task${total !== 1 ? "s" : ""} today`];
    if (completed > 0) parts.push(`${completed} completed`);
    if (overdue > 0) parts.push(`${overdue} overdue`);
    message = parts.join(", ");
  }

  return (
    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
      {message}
    </p>
  );
}
