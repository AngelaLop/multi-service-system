"use client";

import { useState } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { formatDisplayDate } from "@/lib/dates";
import { MOOD_CONFIG } from "@/lib/emotions";
import Header from "@/components/Header";
import EmotionCheckin from "@/components/EmotionCheckin";
import MoodChart from "@/components/MoodChart";
import { MoodIcon } from "@/components/MoodIcon";

export default function JournalPage() {
  const { entries: journalEntries, deleteEntry } = useJournalEntries();
  const [showCheckin, setShowCheckin] = useState(false);

  const entries = [...journalEntries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

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
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Mood Trend
              </h3>
              <MoodChart entries={journalEntries} />
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
