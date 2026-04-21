"use client";

import { useState, useEffect } from "react";

export default function DailyFact() {
  const [fact, setFact] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/daily-fact")
      .then((res) => res.json())
      .then((data) => setFact(data.fact))
      .catch(() => {});
  }, []);

  if (!fact) return null;

  return (
    <div
      className="flex items-start gap-2 px-3 py-2"
      style={{
        background: "var(--bg-tertiary)",
        maxWidth: "280px",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 mt-0.5"
        style={{ color: "var(--accent-start)" }}
      >
        {/* Light bulb */}
        <circle cx="24" cy="18" r="10" />
        <path d="M20 28h8" />
        <path d="M21 32h6" />
        <path d="M22 36h4" />
        {/* Rays */}
        <path d="M24 4v4M38 18h-4M10 18h4M34 8l-3 3M14 8l3 3" />
      </svg>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--accent-start)" }}>
          Did you know?
        </p>
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {fact}
        </p>
      </div>
    </div>
  );
}
