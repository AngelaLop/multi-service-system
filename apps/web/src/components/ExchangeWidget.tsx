"use client";

import { useFxRate } from "@/hooks/useFxRate";
import { formatRelativeSync } from "@/lib/live-data";

interface ExchangeData {
  rate: number;
  trend: number[];
  direction: "up" | "down" | "flat";
}

function Sparkline({
  data,
  direction,
  width = 80,
  height = 30,
}: {
  data: number[];
  direction: "up" | "down" | "flat";
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const stroke =
    direction === "up"
      ? "var(--event-red-border)"
      : direction === "down"
        ? "var(--event-green-border)"
        : "var(--text-tertiary)";

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ExchangeWidget({ compact = false }: { compact?: boolean }) {
  const { fxRate, loading, error } = useFxRate();
  const data: ExchangeData | null = fxRate
    ? { rate: fxRate.rate, trend: fxRate.trend, direction: fxRate.direction }
    : null;

  if (error || (!loading && !data)) {
    if (compact) return null;
    return (
      <div
        className="p-4"
        style={{
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
          borderLeft: "3px solid var(--accent-start)",
        }}
      >
        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Waiting for live FX data
        </div>
        <div className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
          The worker will write the first USD/COP snapshot after the next sync.
        </div>
      </div>
    );
  }

  if (!data) {
    if (compact) return null;
    return (
      <div
        className="p-4 animate-pulse"
        style={{
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
          borderLeft: "3px solid var(--accent-start)",
        }}
      >
        <div className="h-3 w-20 rounded" style={{ background: "var(--bg-tertiary)" }} />
        <div className="h-5 w-28 rounded mt-2" style={{ background: "var(--bg-tertiary)" }} />
      </div>
    );
  }

  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(data.rate);

  const startRate = data.trend.length >= 2 ? data.trend[0] : data.rate;
  const change = startRate ? data.rate - startRate : 0;
  const changePercent = startRate ? (change / startRate) * 100 : 0;
  const isUp = data.direction === "up";
  const isDown = data.direction === "down";
  const trendColor = isUp
    ? "var(--event-red-border)"
    : isDown
      ? "var(--event-green-border)"
      : "var(--text-tertiary)";
  const changePrefix = isUp ? "+" : "";

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
        <div>
          <div className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            USD/COP
          </div>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            ${formatted}
          </div>
        </div>
        <Sparkline data={data.trend} direction={data.direction} width={50} height={20} />
        <div className="text-[9px] font-medium" style={{ color: trendColor }}>
          {changePrefix}
          {changePercent.toFixed(1)}%
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4"
      style={{
        background: "var(--bg-secondary)",
        border: "var(--border-width) solid var(--border-color)",
        borderLeft: "3px solid var(--accent-start)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            USD / COP
          </div>
          <div className="text-lg font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
            ${formatted}
          </div>
          <div
            className="text-[11px] mt-0.5 font-medium"
            style={{ color: trendColor }}
          >
            {changePrefix}
            {changePercent.toFixed(2)}% 7d
          </div>
          {fxRate && (
            <>
              <div className="mt-2 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                {fxRate.summary}
              </div>
              <div className="text-[10px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                Updated {formatRelativeSync(fxRate.updatedAt)}
              </div>
            </>
          )}
        </div>
        <Sparkline data={data.trend} direction={data.direction} />
      </div>
    </div>
  );
}
