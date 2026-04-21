"use client";

interface CompletionBarProps {
  completed: number;
  total: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function CompletionBar({
  completed,
  total,
  size = "md",
  showLabel = true,
}: CompletionBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const barHeight = heights[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-1 ${barHeight} overflow-hidden`}
        style={{
          background: "var(--bg-tertiary)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <div
          className={`${barHeight} transition-all duration-500 ease-out`}
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, var(--accent-start), var(--accent-end))",
            borderRadius: "var(--radius-sm)",
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: "var(--text-secondary)" }}
        >
          {completed}/{total} ({percent}%)
        </span>
      )}
    </div>
  );
}
