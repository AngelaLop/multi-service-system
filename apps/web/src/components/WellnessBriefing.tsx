"use client";

import { useFxRate } from "@/hooks/useFxRate";
import { useLiveWeather } from "@/hooks/useLiveWeather";
import { useUserSettings } from "@/hooks/useUserSettings";
import { formatRelativeSync } from "@/lib/live-data";

function getLeadMessage(
  focus: "balanced" | "outdoor" | "indoors",
  outdoorScore?: "good" | "caution" | "rest"
) {
  if (focus === "outdoor") {
    if (outdoorScore === "good") return "Good outdoor window. Front-load walks or errands while conditions are comfortable.";
    if (outdoorScore === "caution") return "Outdoor time is possible, but keep it flexible and shorter than usual.";
    return "Today favors indoor structure. Move outdoor plans to a shorter recovery block.";
  }

  if (focus === "indoors") {
    if (outdoorScore === "good") return "Conditions are pleasant, but your setup favors indoor focus with short outside resets.";
    if (outdoorScore === "caution") return "Solid day for indoor work. Use only brief outdoor breaks between tasks.";
    return "Stay inside for core work and recovery. Outside conditions are the least supportive today.";
  }

  if (outdoorScore === "good") return "Balanced day. Good time to mix focused work with a walk or one outdoor errand.";
  if (outdoorScore === "caution") return "Balanced day, but keep your schedule adaptable around the weather.";
  return "Lean on indoor tasks first today and keep outside time intentional.";
}

export default function WellnessBriefing({ eventCount }: { eventCount: number }) {
  const { settings } = useUserSettings();
  const { weather, loading: weatherLoading } = useLiveWeather(settings.weatherCity);
  const { fxRate, loading: fxLoading } = useFxRate();

  if (weatherLoading && fxLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-2/3 rounded" style={{ background: "var(--bg-tertiary)" }} />
        <div className="h-3 w-full rounded" style={{ background: "var(--bg-tertiary)" }} />
        <div className="h-3 w-5/6 rounded" style={{ background: "var(--bg-tertiary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-tertiary)" }}>
          Live planning cue
        </div>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-primary)" }}>
          {getLeadMessage(settings.wellnessFocus, weather?.outdoorScore)}
        </p>
      </div>

      <div className="grid gap-3">
        <div
          className="rounded-xl p-3"
          style={{
            background: "var(--bg-tertiary)",
            border: "var(--border-width) solid var(--border-color)",
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
            Weather
          </div>
          {weather ? (
            <>
              <div className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {weather.displayCity}
              </div>
              <div className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                {weather.wellnessSummary}
              </div>
              <div className="mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Synced {formatRelativeSync(weather.updatedAt)}
              </div>
            </>
          ) : (
            <div className="mt-2 text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
              Waiting for the worker to write the first snapshot for {settings.weatherCity}.
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: "var(--bg-tertiary)",
            border: "var(--border-width) solid var(--border-color)",
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>
            Planner pulse
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {eventCount === 0 ? "No tasks scheduled yet. A 10:00 PM breathing reset is ready." : `${eventCount} planned item${eventCount === 1 ? "" : "s"} today`}
          </div>
          <div className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
            {fxRate ? fxRate.summary : "USD/COP will appear here once the first worker sync lands."}
          </div>
          <div className="mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {fxRate ? `FX synced ${formatRelativeSync(fxRate.updatedAt)}` : "Live FX waiting for sync"}
          </div>
        </div>
      </div>
    </div>
  );
}
