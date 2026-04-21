"use client";

import { useLiveWeather } from "@/hooks/useLiveWeather";
import { useUserSettings } from "@/hooks/useUserSettings";
import { formatRelativeSync } from "@/lib/live-data";

function formatShortDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function WeatherWidget({ expanded = false, embedded = false }: { expanded?: boolean; embedded?: boolean }) {
  const { settings } = useUserSettings();
  const { weather, loading, error } = useLiveWeather(settings.weatherCity);

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Weather unavailable
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg animate-pulse" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
        <div className="w-8 h-8 rounded-full" style={{ background: "var(--bg-surface)" }} />
        <div className="w-16 h-3 rounded" style={{ background: "var(--bg-surface)" }} />
      </div>
    );
  }

  if (!weather) {
    return (
      <div
        className="p-4"
        style={embedded ? {} : {
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
          borderLeft: "3px solid var(--accent-start)",
        }}
      >
        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Waiting for live weather
        </div>
        <div className="mt-2 text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
          The worker will add {settings.weatherCity} after the next sync.
        </div>
      </div>
    );
  }

  if (expanded) {
    return (
      <div
        className="p-4"
        style={embedded ? {} : {
          background: "var(--bg-secondary)",
          border: "var(--border-width) solid var(--border-color)",
          borderLeft: "3px solid var(--accent-start)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            className="w-14 h-14"
          />
          <div className="flex-1">
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {Math.round(weather.temp)} C
            </div>
            <div className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}>
              {weather.description}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {weather.displayCity}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
          {weather.wellnessSummary}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 text-center" style={{ borderTop: "var(--border-width) solid var(--border-color)" }}>
          <div>
            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Feels like</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              {Math.round(weather.feelsLike ?? weather.temp)} C
            </div>
          </div>
          <div>
            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Humidity</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              {weather.humidity ?? "-"}%
            </div>
          </div>
          <div>
            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Wind</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              {weather.windSpeed != null ? `${weather.windSpeed.toFixed(1)} m/s` : "-"}
            </div>
          </div>
        </div>

        {weather.tempMin != null && weather.tempMax != null && (
          <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            <span>H: {Math.round(weather.tempMax)} C</span>
            <span>L: {Math.round(weather.tempMin)} C</span>
            <span>Updated {formatRelativeSync(weather.updatedAt)}</span>
          </div>
        )}

        {weather.forecast.length > 0 && (
          <div className="grid grid-cols-4 gap-1 mt-3 pt-3" style={{ borderTop: "var(--border-width) solid var(--border-color)" }}>
            {weather.forecast.map((forecast) => (
              <div key={forecast.date} className="text-center">
                <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {formatShortDay(forecast.date)}
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${forecast.icon}.png`}
                  alt={forecast.description}
                  className="w-8 h-8 mx-auto"
                />
                <div className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                  {forecast.temp} C
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.description}
        className="w-8 h-8"
      />
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {Math.round(weather.temp)} C
        </div>
        <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {weather.displayCity}
        </div>
      </div>
    </div>
  );
}
