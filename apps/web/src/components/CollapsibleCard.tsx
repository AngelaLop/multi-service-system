"use client";

import { useState } from "react";

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hint?: string;
}

export default function CollapsibleCard({ title, children, defaultOpen = true, hint }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            {title}
          </span>
          {!open && hint && (
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
              {hint}
            </span>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-tertiary)" }}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="px-0 pb-0">{children}</div>}
    </div>
  );
}
