"use client";

export default function EmailWidget({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      className="p-4 flex flex-col items-center justify-center gap-3 text-center"
      style={embedded ? { minHeight: "80px" } : {
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
        borderLeft: "3px solid var(--accent-start)",
        minHeight: "120px",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--text-tertiary)" }}
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Connect your email
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          Coming in Week 3
        </p>
      </div>
    </div>
  );
}
