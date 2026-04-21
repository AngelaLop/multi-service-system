import type { EventColor } from "@/types";

export const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
}

export const EVENT_COLORS: Record<
  EventColor,
  { bg: string; border: string; text: string }
> = {
  blue: {
    bg: "var(--event-blue-bg)",
    border: "var(--event-blue-border)",
    text: "var(--event-blue-text)",
  },
  red: {
    bg: "var(--event-red-bg)",
    border: "var(--event-red-border)",
    text: "var(--event-red-text)",
  },
  green: {
    bg: "var(--event-green-bg)",
    border: "var(--event-green-border)",
    text: "var(--event-green-text)",
  },
  purple: {
    bg: "var(--event-purple-bg)",
    border: "var(--event-purple-border)",
    text: "var(--event-purple-text)",
  },
  amber: {
    bg: "var(--event-amber-bg)",
    border: "var(--event-amber-border)",
    text: "var(--event-amber-text)",
  },
};

export const COLOR_OPTIONS: EventColor[] = [
  "blue",
  "red",
  "green",
  "purple",
  "amber",
];

export const GRID_START_HOUR = 6;
export const GRID_END_HOUR = 23;
export const GRID_TOTAL_MINUTES = TIME_SLOTS.length * 60; // 1080 — matches visual row count
