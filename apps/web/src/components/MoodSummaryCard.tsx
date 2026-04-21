"use client";

import Link from "next/link";
import { MOOD_CONFIG } from "@/lib/emotions";
import { MoodIcon } from "@/components/MoodIcon";
import type { JournalEntry } from "@/types";

interface MoodSummaryCardProps {
  entry: JournalEntry;
  onCheckInAgain: () => void;
}

export default function MoodSummaryCard({ entry, onCheckInAgain }: MoodSummaryCardProps) {
  const config = MOOD_CONFIG[entry.mood];
  const time = new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="p-6 animate-[fadeIn_0.6s_ease-in]"
      style={{
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
        borderLeft: `3px solid ${config.color}`,
      }}
    >
      <div className="flex items-center gap-4">
        <MoodIcon mood={entry.mood} size={40} style={{ color: config.color }} />
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Feeling {entry.emotion}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Checked in at {time}
            {entry.tags.length > 0 && <> · {entry.tags.join(", ")}</>}
          </div>
          {entry.text && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {entry.text}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={onCheckInAgain}
          className="px-4 py-2 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          Check in again
        </button>
        <Link
          href="/journal"
          className="px-4 py-2 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
          style={{ color: "var(--accent-start)" }}
        >
          View journal
        </Link>
      </div>
    </div>
  );
}
