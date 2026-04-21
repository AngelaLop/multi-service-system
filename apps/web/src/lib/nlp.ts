import { addDays, format, getDay } from "date-fns";
import { todayString } from "./dates";

export interface ParsedQuickAdd {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  hasDate: boolean;
  hasTime: boolean;
}

const DAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function parseTime(input: string): { hours: number; minutes: number; matched: string } | null {
  // 12-hour with minutes: "3:30pm", "3:30 PM"
  const m1 = input.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i);
  if (m1) {
    let h = parseInt(m1[1]);
    const min = parseInt(m1[2]);
    const ampm = m1[3].toLowerCase();
    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      return { hours: h, minutes: min, matched: m1[0] };
    }
  }

  // 12-hour without minutes: "3pm", "3 pm"
  const m2 = input.match(/\b(\d{1,2})\s*(am|pm)\b/i);
  if (m2) {
    let h = parseInt(m2[1]);
    const ampm = m2[2].toLowerCase();
    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    if (h >= 0 && h <= 23) {
      return { hours: h, minutes: 0, matched: m2[0] };
    }
  }

  // 24-hour: "15:00", "09:30"
  const m3 = input.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m3) {
    const h = parseInt(m3[1]);
    const min = parseInt(m3[2]);
    return { hours: h, minutes: min, matched: m3[0] };
  }

  return null;
}

function parseDate(input: string): { date: Date; matched: string } | null {
  const lower = input.toLowerCase();
  const today = new Date();

  if (/\btomorrow\b/.test(lower)) {
    return { date: addDays(today, 1), matched: lower.match(/\btomorrow\b/)![0] };
  }

  if (/\btoday\b/.test(lower)) {
    return { date: today, matched: lower.match(/\btoday\b/)![0] };
  }

  // "next monday", "next tue"
  const nextDayMatch = lower.match(/\bnext\s+(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)\b/);
  if (nextDayMatch) {
    const targetDay = DAY_MAP[nextDayMatch[1]];
    if (targetDay !== undefined) {
      const currentDay = getDay(today);
      const daysUntil = ((targetDay - currentDay + 7) % 7) || 7;
      return { date: addDays(today, daysUntil + 7), matched: nextDayMatch[0] };
    }
  }

  // "monday", "tue", etc.
  const dayMatch = lower.match(/\b(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)\b/);
  if (dayMatch) {
    const targetDay = DAY_MAP[dayMatch[1]];
    if (targetDay !== undefined) {
      const currentDay = getDay(today);
      const daysUntil = ((targetDay - currentDay + 7) % 7) || 7;
      return { date: addDays(today, daysUntil), matched: dayMatch[0] };
    }
  }

  return null;
}

export function parseQuickAdd(input: string): ParsedQuickAdd {
  const trimmed = input.trim();
  if (!trimmed) {
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    return {
      title: "",
      date: todayString(),
      startTime: `${nextHour.toString().padStart(2, "0")}:00`,
      endTime: `${((nextHour + 1) % 24).toString().padStart(2, "0")}:00`,
      hasDate: false,
      hasTime: false,
    };
  }

  let remaining = trimmed;
  let hasTime = false;
  let hasDate = false;
  let startHours: number;
  let startMinutes: number;
  let dateStr: string;

  // Parse time
  const timeResult = parseTime(remaining.toLowerCase());
  if (timeResult) {
    hasTime = true;
    startHours = timeResult.hours;
    startMinutes = timeResult.minutes;
    // Remove matched time from remaining (case-insensitive)
    const idx = remaining.toLowerCase().indexOf(timeResult.matched);
    remaining = remaining.slice(0, idx) + remaining.slice(idx + timeResult.matched.length);
    // Also strip "at" before the time position
    remaining = remaining.replace(/\bat\s*$/i, "").replace(/\bat\s+$/i, "");
    // Strip "at " that might be left in the middle
    remaining = remaining.replace(/\s+at\s*$/i, "");
  } else {
    const now = new Date();
    startHours = now.getHours() + 1;
    startMinutes = 0;
  }

  // Parse date
  const dateResult = parseDate(remaining.toLowerCase());
  if (dateResult) {
    hasDate = true;
    dateStr = format(dateResult.date, "yyyy-MM-dd");
    const idx = remaining.toLowerCase().indexOf(dateResult.matched);
    remaining = remaining.slice(0, idx) + remaining.slice(idx + dateResult.matched.length);
  } else {
    dateStr = todayString();
  }

  // Clean up title
  const title = remaining.replace(/\s+/g, " ").trim();

  const startTime = `${startHours.toString().padStart(2, "0")}:${startMinutes.toString().padStart(2, "0")}`;
  const endHours = (startHours + 1) % 24;
  const endTime = `${endHours.toString().padStart(2, "0")}:${startMinutes.toString().padStart(2, "0")}`;

  return { title, date: dateStr, startTime, endTime, hasDate, hasTime };
}
