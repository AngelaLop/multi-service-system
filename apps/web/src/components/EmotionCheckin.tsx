"use client";

import { useState, useEffect, useCallback } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { todayString } from "@/lib/dates";
import { MOOD_CONFIG, MOOD_LEVELS, CONTEXT_TAGS } from "@/lib/emotions";
import { MoodIcon, EmotionIcon } from "@/components/MoodIcon";
import type { MoodLevel } from "@/types";

function BreathingCircle({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const TOTAL = 16000; // 2 full cycles: 4s in + 4s out × 2

  useEffect(() => {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 50;
      const cycleTime = elapsed % 8000; // 8s per cycle (4 in + 4 out)
      setPhase(cycleTime < 4000 ? "inhale" : "exhale");
      setProgress(Math.min(elapsed / TOTAL, 1));
      if (elapsed >= TOTAL) {
        clearInterval(interval);
        setFading(true);
        setTimeout(onComplete, 1200);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  const scale = phase === "inhale" ? 1.5 : 0.7;

  return (
    <div
      className="flex flex-col items-center gap-8 py-6 transition-opacity duration-1000"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Soft glow behind */}
        <div
          className="absolute rounded-full transition-transform duration-[4000ms] ease-in-out"
          style={{
            width: 120,
            height: 120,
            background: "radial-gradient(circle, var(--accent-start) 0%, transparent 70%)",
            transform: `scale(${scale * 0.9})`,
            opacity: 0.15,
            filter: "blur(20px)",
          }}
        />
        {/* Outer ring */}
        <svg width="160" height="160" className="absolute">
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--bg-tertiary)" strokeWidth="2" opacity="0.3" />
          <circle
            cx="80" cy="80" r="72"
            fill="none"
            stroke="var(--accent-start)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress)}`}
            transform="rotate(-90 80 80)"
            className="transition-all duration-100"
            opacity="0.6"
          />
        </svg>
        {/* Breathing circle */}
        <div
          className="rounded-full transition-transform duration-[4000ms] ease-in-out"
          style={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
            transform: `scale(${scale})`,
            opacity: 0.6,
            boxShadow: "0 0 40px var(--accent-start)",
          }}
        />
      </div>
      <p
        className="text-sm font-light tracking-widest uppercase transition-all duration-1000"
        style={{ color: "var(--text-tertiary)", letterSpacing: "0.15em" }}
      >
        {phase === "inhale" ? "breathe in" : "breathe out"}
      </p>
    </div>
  );
}

interface EmotionCheckinProps {
  onComplete: () => void;
}

export default function EmotionCheckin({ onComplete }: EmotionCheckinProps) {
  const { addEntry } = useJournalEntries();
  const [step, setStep] = useState(-2); // -2 = intro, -1 = breathing
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [emotion, setEmotion] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");

  const handleBreathingComplete = useCallback(() => setStep(0), []);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!mood) return;
    await addEntry({
      date: todayString(),
      mood,
      emotion: emotion || MOOD_CONFIG[mood].label,
      tags,
      text,
      createdAt: new Date().toISOString(),
    });
    onComplete();
  }

  const prompts = [
    "Now... how are you feeling?",
    "Can you name it more specifically?",
    "What might be connected to this feeling?",
    "Anything you'd like to write down?",
  ];

  // Intro screen — gentle invitation before breathing
  if (step === -2) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 animate-[fadeIn_1s_ease-in]">
        <MoodIcon mood="okay" size={48} className="opacity-30" style={{ color: "var(--text-tertiary)" }} />
        <div className="text-center space-y-2">
          <p className="text-sm font-light" style={{ color: "var(--text-secondary)" }}>
            Let&apos;s breathe for a moment
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            A short pause to center yourself
          </p>
        </div>
        <button
          onClick={() => setStep(-1)}
          className="px-6 py-2 text-xs font-medium rounded-full transition-all duration-300 hover:opacity-80"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          I&apos;m ready
        </button>
        <button
          onClick={() => setStep(0)}
          className="text-[11px] transition-opacity hover:opacity-80"
          style={{ color: "var(--text-tertiary)" }}
        >
          Skip to journal
        </button>
      </div>
    );
  }

  // Breathing step
  if (step === -1) {
    return (
      <div className="space-y-2 animate-[fadeIn_0.6s_ease-in]">
        <BreathingCircle onComplete={handleBreathingComplete} />
        <div className="text-center pt-2">
          <button
            onClick={() => setStep(0)}
            className="text-[11px] transition-opacity hover:opacity-80"
            style={{ color: "var(--text-tertiary)" }}
          >
            Skip breathing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.8s_ease-in]">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i <= step ? "var(--accent-start)" : "var(--bg-tertiary)",
              transform: i === step ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Prompt */}
      <p
        className="text-center text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {prompts[step]}
      </p>

      {/* Step 0: Mood level */}
      {step === 0 && (
        <div className="flex justify-center gap-3">
          {MOOD_LEVELS.map((level) => {
            const config = MOOD_CONFIG[level];
            const selected = mood === level;
            return (
              <button
                key={level}
                onClick={() => { setMood(level); setEmotion(""); setTimeout(() => setStep(1), 200); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
                style={{
                  background: selected ? config.color + "22" : "var(--bg-tertiary)",
                  border: selected ? `2px solid ${config.color}` : "2px solid transparent",
                  minWidth: "64px",
                }}
              >
                <MoodIcon mood={level} size={28} style={{ color: selected ? config.color : "var(--text-tertiary)" }} />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: selected ? config.color : "var(--text-tertiary)" }}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1: Specific emotion */}
      {step === 1 && mood && (
        <div className="flex flex-wrap justify-center gap-2">
          {MOOD_CONFIG[mood].emotions.map((em) => {
            const selected = emotion === em;
            return (
              <button
                key={em}
                onClick={() => { setEmotion(em); setTimeout(() => setStep(2), 200); }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all duration-200"
                style={{
                  background: selected ? MOOD_CONFIG[mood].color + "33" : "var(--bg-tertiary)",
                  color: selected ? MOOD_CONFIG[mood].color : "var(--text-secondary)",
                  border: selected ? `1px solid ${MOOD_CONFIG[mood].color}` : "1px solid transparent",
                }}
              >
                <EmotionIcon emotion={em} size={14} />
                {em}
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Context tags */}
      {step === 2 && (
        <div>
          <div className="flex flex-wrap justify-center gap-2">
            {CONTEXT_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-full transition-all duration-200"
                  style={{
                    background: selected ? "var(--accent-start)" + "33" : "var(--bg-tertiary)",
                    color: selected ? "var(--accent-start)" : "var(--text-tertiary)",
                    border: selected ? "1px solid var(--accent-start)" : "1px solid transparent",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 text-xs font-medium rounded-lg transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                color: "white",
              }}
            >
              {tags.length > 0 ? "Continue" : "Skip"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Free text */}
      {step === 3 && (
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write freely... this is just for you."
            rows={4}
            autoFocus
            className="w-full px-4 py-3 text-sm outline-none resize-none transition-colors focus:ring-1"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "var(--border-width) solid var(--border-color)",
              // @ts-expect-error CSS custom property
              "--tw-ring-color": "var(--accent-start)",
            }}
          />

          {/* Summary before saving */}
          {mood && (
            <div
              className="flex items-center gap-3 px-4 py-3 text-xs"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              <MoodIcon mood={mood} size={24} style={{ color: MOOD_CONFIG[mood].color }} />
              <span>
                Feeling <strong style={{ color: MOOD_CONFIG[mood].color }}>{emotion || MOOD_CONFIG[mood].label}</strong>
                {tags.length > 0 && <> · {tags.join(", ")}</>}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              }}
            >
              Save Entry
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 text-xs font-medium rounded-lg"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              Skip writing
            </button>
          </div>
        </div>
      )}

      {/* Back button (steps 1-3) */}
      {step > 0 && step < 3 && (
        <div className="flex justify-center">
          <button
            onClick={() => setStep(step - 1)}
            className="text-[11px] font-medium transition-colors hover:underline"
            style={{ color: "var(--text-tertiary)" }}
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
