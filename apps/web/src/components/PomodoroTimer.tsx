"use client";

import { useEffect } from "react";
import { usePomodoro } from "@/context/PomodoroContext";
import { useEvents } from "@/hooks/useEvents";

const TOTAL_SECONDS = 25 * 60;

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* silent fail */ }
}

export default function PomodoroTimer() {
  const { state: pomo, dispatch } = usePomodoro();
  const { events } = useEvents();

  // Tick every second
  useEffect(() => {
    if (!pomo.running) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [pomo.running, dispatch]);

  // Completion
  useEffect(() => {
    if (pomo.eventId && pomo.timeRemaining === 0 && !pomo.running) {
      playBeep();
      setTimeout(() => dispatch({ type: "STOP" }), 3000);
    }
  }, [pomo.timeRemaining, pomo.running, pomo.eventId, dispatch]);

  if (!pomo.eventId) return null;

  const event = events.find((e) => e.id === pomo.eventId);
  const title = event?.title || "Focus Session";
  const mins = Math.floor(pomo.timeRemaining / 60);
  const secs = pomo.timeRemaining % 60;
  const progress = ((TOTAL_SECONDS - pomo.timeRemaining) / TOTAL_SECONDS) * 100;
  const isComplete = pomo.timeRemaining === 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "2px solid var(--accent-start)",
      }}
    >
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: "var(--bg-tertiary)" }}>
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--accent-start), var(--accent-end))",
          }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-2.5 max-w-5xl mx-auto">
        {/* Pulsing dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${pomo.running ? "animate-pulse" : ""}`}
          style={{ background: isComplete ? "var(--event-green-border)" : "var(--accent-start)" }}
        />

        {/* Event title */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {isComplete ? "Session complete!" : title}
          </div>
        </div>

        {/* Timer */}
        <div
          className="text-lg font-mono font-bold tabular-nums shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
        </div>

        {/* Pause / Resume */}
        {!isComplete && (
          <button
            onClick={() => dispatch({ type: pomo.running ? "PAUSE" : "RESUME" })}
            className="p-1.5 rounded transition-colors hover:opacity-80"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {pomo.running ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ color: "var(--text-primary)" }}>
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ color: "var(--text-primary)" }}>
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
            )}
          </button>
        )}

        {/* Stop */}
        <button
          onClick={() => dispatch({ type: "STOP" })}
          className="p-1.5 rounded transition-colors hover:opacity-80"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ color: "var(--text-tertiary)" }}>
            <rect x="2" y="2" width="10" height="10" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
