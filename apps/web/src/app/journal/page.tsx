"use client";

import { useState } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { formatDisplayDate } from "@/lib/dates";
import { MOOD_CONFIG } from "@/lib/emotions";
import Header from "@/components/Header";
import EmotionCheckin from "@/components/EmotionCheckin";
import MoodChart from "@/components/MoodChart";
import { MoodIcon } from "@/components/MoodIcon";

function weatherTone(outdoorScore?: "good" | "caution" | "rest") {
  if (!outdoorScore) {
    return {
      border: "var(--border-color-strong)",
      label: "Saved weather snapshot",
    };
  }

  if (outdoorScore === "good") {
    return {
      border: "var(--event-green-border)",
      label: "Supportive weather",
    };
  }

  if (outdoorScore === "caution") {
    return {
      border: "var(--event-amber-border)",
      label: "Mixed weather",
    };
  }

  return {
    border: "var(--event-red-border)",
    label: "Tough weather",
  };
}

export default function JournalPage() {
  const { entries: journalEntries, deleteEntry } = useJournalEntries();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  const entries = [...journalEntries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const entriesWithWeather = entries.filter((entry) => entry.weather);
  const entriesWithTemperature = entries.filter((entry) => entry.weather?.temperature != null);
  const lowMoodInToughWeather = entriesWithWeather.filter(
    (entry) =>
      (entry.mood === "low" || entry.mood === "rough") &&
      entry.weather?.outdoorScore &&
      entry.weather.outdoorScore !== "good"
  ).length;
  const goodMoodInGoodWeather = entriesWithWeather.filter(
    (entry) =>
      (entry.mood === "great" || entry.mood === "good") &&
      entry.weather?.outdoorScore === "good"
  ).length;

  const weatherPatternMessage =
    entriesWithWeather.length < 3
      ? "Keep checking in. Once you log a few more entries, Weatherwise can help you spot whether your mood shifts with the weather."
      : lowMoodInToughWeather >= 2 && lowMoodInToughWeather >= goodMoodInGoodWeather
        ? "Your lower-mood entries are showing up more often on caution or rest weather. That looks like a real pattern worth watching."
        : goodMoodInGoodWeather >= 2
          ? "Your stronger entries often land on supportive weather days. Outdoor conditions may be helping your mood and energy."
          : "Your mood history is starting to build weather context, but the pattern is still mixed. Keep logging and compare over time.";

  return (
    <div className="flex flex-col h-full">
      <Header title="Journal" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Check-in card */}
          <div
            className="p-6"
            style={{
              background: "var(--bg-secondary)",
              border: "var(--border-width) solid var(--border-color)",
              borderLeft: "3px solid var(--accent-start)",
            }}
          >
            {showCheckin ? (
              <EmotionCheckin onComplete={() => setShowCheckin(false)} />
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  How are you feeling right now?
                </p>
                <button
                  onClick={() => setShowCheckin(true)}
                  className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                  }}
                >
                  Start Check-in
                </button>
              </div>
            )}
          </div>

          {/* Mood Trend */}
          {journalEntries.length >= 2 && (
            <div
              className="p-5"
              style={{
                background: "var(--bg-secondary)",
                border: "var(--border-width) solid var(--border-color)",
                borderLeft: "3px solid var(--accent-start)",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Mood Trend
                </h3>
                {entriesWithTemperature.length >= 2 && (
                  <button
                    onClick={() => setShowWeatherOverlay((prev) => !prev)}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-full transition-opacity hover:opacity-90"
                    style={{
                      background: showWeatherOverlay ? "var(--accent-start)" : "var(--bg-tertiary)",
                      color: showWeatherOverlay ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {showWeatherOverlay ? "Hide Temp Overlay" : "Show Temp Overlay"}
                  </button>
                )}
              </div>
              <MoodChart entries={journalEntries} showWeatherOverlay={showWeatherOverlay} />
            </div>
          )}

          {entriesWithWeather.length > 0 && (
            <div
              className="p-5"
              style={{
                background: "var(--bg-secondary)",
                border: "var(--border-width) solid var(--border-color)",
                borderLeft: "3px solid var(--event-blue-border)",
              }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Weather Pattern
              </h3>
              <p className="text-xs leading-6" style={{ color: "var(--text-secondary)" }}>
                {weatherPatternMessage}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="px-2.5 py-1 text-[10px] rounded-full"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                >
                  {entriesWithWeather.length} weather-linked entr{entriesWithWeather.length === 1 ? "y" : "ies"}
                </span>
                <span
                  className="px-2.5 py-1 text-[10px] rounded-full"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                >
                  {lowMoodInToughWeather} low / rough on caution or rest weather
                </span>
                <span
                  className="px-2.5 py-1 text-[10px] rounded-full"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                >
                  {goodMoodInGoodWeather} great / good on supportive weather
                </span>
              </div>
            </div>
          )}

          {/* Past entries */}
          {entries.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Past Entries
              </h3>
              {entries.map((entry) => {
                const config = MOOD_CONFIG[entry.mood];
                const tone = weatherTone(entry.weather?.outdoorScore);
                return (
                  <div
                    key={entry.id}
                    className="p-4 group"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "var(--border-width) solid var(--border-color)",
                      borderLeft: `3px solid ${config.color}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <MoodIcon mood={entry.mood} size={28} style={{ color: config.color }} />
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {entry.emotion}
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            {formatDisplayDate(entry.date)} · {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                        title="Delete entry"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] rounded-full"
                            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.text && (
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {entry.text}
                      </p>
                    )}
                    {entry.weather && (
                      <div
                        className="mt-3 flex items-center gap-3 px-3 py-2 text-[11px]"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-tertiary)",
                          borderLeft: `3px solid ${tone.border}`,
                        }}
                      >
                        {entry.weather.icon && (
                          <img
                            src={`https://openweathermap.org/img/wn/${entry.weather.icon}.png`}
                            alt={entry.weather.description || "weather"}
                            className="w-7 h-7"
                          />
                        )}
                        <div className="leading-5">
                          <div style={{ color: "var(--text-secondary)" }}>
                            {entry.weather.city || "Saved weather snapshot"}
                            {entry.weather.temperature != null ? ` · ${entry.weather.temperature} C` : ""}
                            {entry.weather.description ? ` · ${entry.weather.description}` : ""}
                          </div>
                          <div>{tone.label} at the time of this check-in.</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                No journal entries yet. Start your first check-in above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
