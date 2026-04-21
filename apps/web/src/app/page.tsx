"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEvents } from "@/hooks/useEvents";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { todayString, formatDisplayDate, formatLocationTime, formatTime, getCompletionCounts, getHourForLocation, getZenGreeting, isOvernightEvent } from "@/lib/dates";
import CompletionBar from "@/components/CompletionBar";
import WeatherWidget from "@/components/WeatherWidget";
import NewsWidget from "@/components/NewsWidget";
import QuickAddTask from "@/components/QuickAddTask";
import EmailWidget from "@/components/EmailWidget";
import CollapsibleCard from "@/components/CollapsibleCard";
import ExchangeWidget from "@/components/ExchangeWidget";
import EventModal from "@/components/EventModal";
import EmotionCheckin from "@/components/EmotionCheckin";
import MoodSummaryCard from "@/components/MoodSummaryCard";
import WellnessBriefing from "@/components/WellnessBriefing";
import { usePomodoro } from "@/context/PomodoroContext";
import { MoodIcon } from "@/components/MoodIcon";
import DailyFact from "@/components/DailyFact";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { PlannerEvent } from "@/types";

function TimeIllustration({ hour }: { hour: number }) {
  const color = "var(--accent-start)";
  // Morning: sunrise with bamboo
  if (hour < 12) return (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <path d="M8 36h32" />
      <path d="M24 36v-20" />
      <path d="M24 20q-6 2-8 8" />
      <path d="M24 24q-4 1-6 5" />
      <path d="M24 16q5 3 7 10" />
      <circle cx="36" cy="16" r="6" />
      <path d="M36 6v2M44 16h-2M36 26v-2M28 16h2M41 11l-1.5 1.5M41 21l-1.5-1.5M31 11l1.5 1.5" />
    </svg>
  );
  // Afternoon: sun with bamboo stalks
  if (hour < 17) return (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <path d="M10 38h28" />
      <path d="M16 38v-22" />
      <path d="M16 20q-5 2-7 7" />
      <path d="M16 26q-3 1-5 4" />
      <path d="M28 38v-16" />
      <path d="M28 26q4 2 6 6" />
      <path d="M28 30q3 1 4 4" />
      <circle cx="36" cy="12" r="5" />
      <path d="M36 4v2M43 12h-2M36 20v-2M29 12h2" />
    </svg>
  );
  // Evening/night: moon with bamboo
  return (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <path d="M10 38h28" />
      <path d="M20 38v-24" />
      <path d="M20 18q-5 2-7 7" />
      <path d="M20 24q-3 1-5 4" />
      <path d="M20 14q4 3 6 10" />
      <path d="M36 20a8 8 0 1 1-5-7.5 6 6 0 0 0 5 7.5z" />
      <circle cx="32" cy="8" r="1" />
      <circle cx="40" cy="14" r="0.8" />
      <circle cx="38" cy="6" r="0.5" />
    </svg>
  );
}

const cardStyle = {
  background: "var(--bg-secondary)",
  border: "var(--border-width) solid var(--border-color)",
};

export default function Home() {
  const { user } = useUser();
  const { settings } = useUserSettings();
  const { events, toggleComplete, addEvent } = useEvents();
  const { entries: journalEntries } = useJournalEntries();
  const { state: pomo, dispatch: pomoDispatch } = usePomodoro();
  const [selectedEvent, setSelectedEvent] = useState<PlannerEvent | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [addingWindDown, setAddingWindDown] = useState(false);
  const today = todayString();
  const todayEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const { completed, total } = getCompletionCounts(events, today);
  const upcomingEvents = events
    .filter((e) => e.date >= today && e.date !== today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);
  const todayEntry = journalEntries.find((j) => j.date === today);
  const cityHour = getHourForLocation(settings.weatherCity);
  const greeting = getZenGreeting(user?.firstName || undefined, cityHour);
  const cityTimeLabel = formatLocationTime(settings.weatherCity);
  const illustrationHour = cityHour ?? new Date().getHours();

  const addWindDownBreathing = async () => {
    const alreadyScheduled = todayEvents.some(
      (event) => event.title === "Breathing Time" && event.startTime === "22:00"
    );

    if (alreadyScheduled || addingWindDown) {
      return;
    }

    setAddingWindDown(true);
    try {
      await addEvent({
        title: "Breathing Time",
        description: "Wind-down breathing before sleep.",
        date: today,
        startTime: "22:00",
        endTime: "22:15",
        color: "green",
        completed: false,
      });
    } finally {
      setAddingWindDown(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">

          {/* Greeting Banner */}
          <div className="p-4 sm:p-5" style={cardStyle}>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block"><TimeIllustration hour={illustrationHour} /></div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-light" style={{ color: "var(--text-primary)" }}>
                  {greeting.text} <span className="font-semibold">{greeting.name}</span>
                </h1>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {formatDisplayDate(today)}
                  {cityTimeLabel ? ` · ${settings.weatherCity} local time ${cityTimeLabel}` : ""}
                </p>
              </div>
              <div className="hidden md:block"><DailyFact /></div>
            </div>
            <div className="md:hidden mt-3"><DailyFact /></div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left Column — shows after right column on mobile */}
            <div className="space-y-5 lg:col-span-1 order-2 lg:order-1">
              <CollapsibleCard title="Live Wellness Briefing">
                <div className="p-4">
                  <WellnessBriefing eventCount={todayEvents.length} />
                </div>
              </CollapsibleCard>
              <CollapsibleCard title="Weather Forecast">
                <WeatherWidget expanded embedded />
              </CollapsibleCard>
              <CollapsibleCard title="USD / COP" defaultOpen={false}>
                <div className="p-4"><ExchangeWidget /></div>
              </CollapsibleCard>
              <CollapsibleCard title="World Headlines" defaultOpen={false}>
                <NewsWidget embedded />
              </CollapsibleCard>
              <CollapsibleCard title="Email" defaultOpen={false}>
                <EmailWidget embedded />
              </CollapsibleCard>
            </div>

            {/* Right Column — shows first on mobile */}
            <div className="lg:col-span-2 space-y-5 order-1 lg:order-2">

              {/* Emotion Check-in */}
              <div className="p-6" style={cardStyle}>
                {showCheckin ? (
                  <EmotionCheckin onComplete={() => setShowCheckin(false)} />
                ) : todayEntry ? (
                  <MoodSummaryCard entry={todayEntry} onCheckInAgain={() => setShowCheckin(true)} />
                ) : (
                  <div className="text-center space-y-4 py-4 animate-[fadeIn_0.6s_ease-in]">
                    <MoodIcon mood="okay" size={48} className="mx-auto opacity-50" style={{ color: "var(--text-secondary)" }} />
                    <p className="text-sm font-light" style={{ color: "var(--text-secondary)" }}>
                      How are you feeling today?
                    </p>
                    <button
                      onClick={() => setShowCheckin(true)}
                      className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
                    >
                      Start Check-in
                    </button>
                  </div>
                )}
              </div>

              {/* Today's Schedule */}
              <div className="p-4" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Today&apos;s Schedule
                  </h3>
                  <Link
                    href="/new"
                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
                  >
                    + Add Event
                  </Link>
                </div>
                <div className="mb-3">
                  <QuickAddTask />
                </div>
                {todayEvents.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      No events today yet. Start with a default wind-down block at 10:00 PM, or{" "}
                      <Link href="/new" className="font-medium underline" style={{ color: "var(--accent-start)" }}>
                        add your own event
                      </Link>.
                    </p>
                    <div
                      className="mt-4 mx-auto max-w-md rounded-xl p-4 text-left"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "var(--border-width) solid var(--border-color)",
                        borderLeft: "3px solid var(--event-green-border)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            Breathing Time
                          </div>
                          <div className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                            10:00 PM - 10:15 PM
                          </div>
                          <div className="mt-2 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                            A short wind-down reset before sleep, so the day closes with something intentional.
                          </div>
                        </div>
                        <button
                          onClick={addWindDownBreathing}
                          disabled={addingWindDown}
                          className="px-3 py-2 text-xs font-medium text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg, var(--event-green-border), var(--accent-end))" }}
                        >
                          {addingWindDown ? "Adding..." : "Add to Today"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                        style={{
                          background: "var(--bg-tertiary)",
                          borderRadius: "var(--radius-sm)",
                          borderLeft: `3px solid var(--event-${event.color}-border)`,
                          opacity: event.completed ? 0.5 : 1,
                        }}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleComplete(event.id); }}
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{
                            borderColor: `var(--event-${event.color}-border)`,
                            background: event.completed ? `var(--event-${event.color}-border)` : "transparent",
                          }}
                        >
                          {event.completed && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)", textDecoration: event.completed ? "line-through" : "none" }}>
                            {event.title}
                          </div>
                          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            {formatTime(event.startTime)} – {formatTime(event.endTime)}{isOvernightEvent(event.startTime, event.endTime) ? " +1d" : ""}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const isActive = pomo.eventId === event.id;
                            if (isActive) pomoDispatch({ type: pomo.running ? "PAUSE" : "RESUME" });
                            else pomoDispatch({ type: "START", payload: event.id });
                          }}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors hover:opacity-80"
                          style={{ background: pomo.eventId === event.id ? "var(--accent-start)" : "var(--bg-surface, var(--bg-tertiary))" }}
                          title="Focus timer"
                        >
                          {pomo.eventId === event.id && pomo.running ? (
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" style={{ color: pomo.eventId === event.id ? "white" : "var(--text-tertiary)" }}>
                              <path d="M2.5 1v10l8-5z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {total > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: "var(--border-width) solid var(--border-color)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Progress</span>
                      <Link href={`/day/${today}`} className="text-xs font-medium hover:underline" style={{ color: "var(--accent-start)" }}>View Day</Link>
                    </div>
                    <CompletionBar completed={completed} total={total} size="sm" />
                  </div>
                )}
              </div>

              {/* Upcoming */}
              {upcomingEvents.length > 0 && (
                <div className="p-4" style={cardStyle}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Upcoming</h3>
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/day/${event.date}`} className="flex items-center gap-3 p-2 rounded-lg hover:opacity-80" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ background: `var(--event-${event.color}-border)` }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{event.title}</div>
                          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{event.date} · {formatTime(event.startTime)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
