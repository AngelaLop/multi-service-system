"use client";

import { MOOD_CONFIG } from "@/lib/emotions";
import { moodToNumber } from "@/lib/emotions";
import type { JournalEntry, MoodLevel } from "@/types";

interface MoodChartProps {
  entries: JournalEntry[];
  showWeatherOverlay?: boolean;
}

export default function MoodChart({ entries, showWeatherOverlay = false }: MoodChartProps) {
  if (entries.length < 2) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Add a few more entries to see your mood trend
        </p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const w = 320;
  const h = 120;
  const padX = 30;
  const padY = 15;

  const points = sorted.map((entry, i) => {
    const x = padX + (i / (sorted.length - 1)) * (w - padX * 2);
    const val = moodToNumber(entry.mood);
    const y = padY + ((5 - val) / 4) * (h - padY * 2);
    return { x, y, entry };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const weatherEntries = sorted.filter((entry) => entry.weather?.temperature != null);
  const temperatures = weatherEntries.map((entry) => Number(entry.weather?.temperature));
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
  const tempRange = maxTemp - minTemp || 1;
  const weatherPoints = sorted
    .map((entry, i) => {
      if (entry.weather?.temperature == null) {
        return null;
      }

      const x = padX + (i / (sorted.length - 1)) * (w - padX * 2);
      const y =
        padY +
        (1 - (Number(entry.weather.temperature) - minTemp) / tempRange) * (h - padY * 2);

      return { x, y, entry };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);
  const weatherPolyline = weatherPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Y-axis labels
  const levels: MoodLevel[] = ["great", "good", "okay", "low", "rough"];

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h + 10} className="w-full" viewBox={`0 0 ${w} ${h + 10}`}>
        {/* Horizontal grid lines */}
        {[1, 2, 3, 4, 5].map((val) => {
          const y = padY + ((5 - val) / 4) * (h - padY * 2);
          return (
            <line
              key={val}
              x1={padX}
              y1={y}
              x2={w - padX}
              y2={y}
              stroke="var(--border-color)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Y labels */}
        {levels.map((level, i) => {
          const val = 5 - i;
          const y = padY + ((5 - val) / 4) * (h - padY * 2);
          return (
            <text
              key={level}
              x={padX - 4}
              y={y + 3}
              textAnchor="end"
              fontSize="7"
              fill={MOOD_CONFIG[level].color}
              fontWeight="500"
            >
              {MOOD_CONFIG[level].label}
            </text>
          );
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-start)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-start)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${points[0].x},${h - padY} ${polyline} ${points[points.length - 1].x},${h - padY}`}
          fill="url(#moodGrad)"
        />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--accent-start)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showWeatherOverlay && weatherPoints.length >= 2 && (
          <>
            <polyline
              points={weatherPolyline}
              fill="none"
              stroke="var(--event-blue-border)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 4"
            />
            {weatherPoints.map((point, i) => (
              <circle
                key={`weather-${i}`}
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="var(--event-blue-border)"
                stroke="var(--bg-secondary)"
                strokeWidth="1"
              />
            ))}
            <text
              x={w - padX + 4}
              y={padY + 3}
              fontSize="7"
              fill="var(--event-blue-border)"
              fontWeight="500"
            >
              {Math.round(maxTemp)} C
            </text>
            <text
              x={w - padX + 4}
              y={h - padY + 3}
              fontSize="7"
              fill="var(--event-blue-border)"
              fontWeight="500"
            >
              {Math.round(minTemp)} C
            </text>
          </>
        )}

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill={MOOD_CONFIG[p.entry.mood].color}
              stroke="var(--bg-secondary)"
              strokeWidth="2"
            />
            {/* Date label for first, last, and every 3rd */}
            {(i === 0 || i === points.length - 1 || i % 3 === 0) && (
              <text
                x={p.x}
                y={h + 6}
                textAnchor="middle"
                fontSize="7"
                fill="var(--text-tertiary)"
              >
                {p.entry.date.slice(5)} {/* MM-DD */}
              </text>
            )}
          </g>
        ))}
      </svg>
      {showWeatherOverlay && weatherPoints.length >= 2 && (
        <div className="mt-2 flex items-center gap-4 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-[2px] w-4" style={{ background: "var(--accent-start)" }} />
            Mood
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-[2px] w-4"
              style={{
                background: "var(--event-blue-border)",
                borderTop: "1px dashed var(--event-blue-border)",
              }}
            />
            Temperature
          </span>
        </div>
      )}
    </div>
  );
}
