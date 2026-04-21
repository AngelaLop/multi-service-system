import {
  format,
  startOfWeek,
  addDays,
  isToday as fnsIsToday,
  isSameDay as fnsIsSameDay,
  parseISO,
} from "date-fns";
import { GRID_START_HOUR, GRID_TOTAL_MINUTES } from "./constants";
import type { PlannerEvent } from "@/types";

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d");
}

export function formatWeekRange(date: Date): string {
  const days = getWeekDays(date);
  return `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`;
}

export function formatDayHeader(date: Date): string {
  return format(date, "EEE d");
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayString(): string {
  return toDateString(new Date());
}

export function isToday(dateStr: string): boolean {
  return fnsIsToday(parseISO(dateStr));
}

export function isSameDay(a: string, b: string): boolean {
  return fnsIsSameDay(parseISO(a), parseISO(b));
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getEventPosition(
  startTime: string,
  endTime: string
): { top: number; height: number } {
  const startMin = timeToMinutes(startTime) - GRID_START_HOUR * 60;
  let endMin = timeToMinutes(endTime) - GRID_START_HOUR * 60;
  // Overnight event: endTime < startTime means it ends the next day
  // Show it from startTime to end of grid
  if (endMin <= startMin) {
    endMin = GRID_TOTAL_MINUTES;
  }
  const top = (startMin / GRID_TOTAL_MINUTES) * 100;
  const height = ((endMin - startMin) / GRID_TOTAL_MINUTES) * 100;
  return { top: Math.max(0, top), height: Math.max(0, height) };
}

export function isOvernightEvent(startTime: string, endTime: string): boolean {
  return timeToMinutes(endTime) < timeToMinutes(startTime);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Angela!";
  if (hour < 17) return "Good afternoon, Angela!";
  return "Good evening, Angela!";
}

const CITY_TIMEZONE_ALIASES: Record<string, string> = {
  bogota: "America/Bogota",
  chicago: "America/Chicago",
  london: "Europe/London",
  losangeles: "America/Los_Angeles",
  madrid: "Europe/Madrid",
  medellin: "America/Bogota",
  mexico: "America/Mexico_City",
  miami: "America/New_York",
  newyork: "America/New_York",
  paris: "Europe/Paris",
  rome: "Europe/Rome",
  sanfrancisco: "America/Los_Angeles",
  tokyo: "Asia/Tokyo",
  toronto: "America/Toronto",
  washingtondc: "America/New_York",
};

function normalizeLocationPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

export function resolveTimeZoneFromLocation(location?: string): string | null {
  if (!location?.trim()) return null;

  const cityPart = normalizeLocationPart(location.split(",")[0] || location);
  if (CITY_TIMEZONE_ALIASES[cityPart]) {
    return CITY_TIMEZONE_ALIASES[cityPart];
  }

  if (typeof Intl.supportedValuesOf !== "function") {
    return null;
  }

  const match = Intl.supportedValuesOf("timeZone").find((timeZone) => {
    const parts = timeZone.split("/");
    const lastPart = normalizeLocationPart(parts[parts.length - 1].replace(/_/g, " "));
    return lastPart === cityPart;
  });

  return match || null;
}

export function getHourForLocation(location?: string): number | null {
  const timeZone = resolveTimeZoneFromLocation(location);
  if (!timeZone) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone,
  }).formatToParts(new Date());

  const hourPart = parts.find((part) => part.type === "hour")?.value;
  const hour = Number(hourPart);
  return Number.isFinite(hour) ? hour : null;
}

export function formatLocationTime(location?: string): string | null {
  const timeZone = resolveTimeZoneFromLocation(location);
  if (!timeZone) return null;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date());
}

export function getZenGreeting(name?: string, hourOverride?: number | null): { text: string; name: string } {
  const hour = hourOverride ?? new Date().getHours();
  const displayName = name || "there";
  if (hour < 12) return { text: "Good morning,", name: displayName };
  if (hour < 17) return { text: "Good afternoon,", name: displayName };
  return { text: "Good evening,", name: displayName };
}

export function getCompletionPercent(events: PlannerEvent[], dateStr: string): number {
  const dayEvents = events.filter((e) => e.date === dateStr);
  if (dayEvents.length === 0) return 0;
  const completed = dayEvents.filter((e) => e.completed).length;
  return Math.round((completed / dayEvents.length) * 100);
}

export function getCompletionCounts(
  events: PlannerEvent[],
  dateStr: string
): { completed: number; total: number } {
  const dayEvents = events.filter((e) => e.date === dateStr);
  return {
    completed: dayEvents.filter((e) => e.completed).length,
    total: dayEvents.length,
  };
}
