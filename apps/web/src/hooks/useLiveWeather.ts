"use client";

import { useCallback, useEffect, useState } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { normalizeCityKey } from "@/lib/live-data";
import type { ForecastItem, LiveWeatherSnapshot } from "@/types";

interface WeatherRow {
  city_key: string;
  display_city: string;
  temp: number;
  description: string;
  icon: string;
  feels_like: number | null;
  humidity: number | null;
  wind_speed: number | null;
  temp_min: number | null;
  temp_max: number | null;
  forecast: ForecastItem[] | null;
  wellness_summary: string;
  outdoor_score: "good" | "caution" | "rest";
  observed_at: string;
  updated_at: string;
}

function rowToSnapshot(row: WeatherRow): LiveWeatherSnapshot {
  return {
    cityKey: row.city_key,
    displayCity: row.display_city,
    temp: Number(row.temp),
    description: row.description,
    icon: row.icon,
    feelsLike: row.feels_like ?? undefined,
    humidity: row.humidity ?? undefined,
    windSpeed: row.wind_speed ?? undefined,
    tempMin: row.temp_min ?? undefined,
    tempMax: row.temp_max ?? undefined,
    forecast: Array.isArray(row.forecast) ? row.forecast : [],
    wellnessSummary: row.wellness_summary,
    outdoorScore: row.outdoor_score,
    observedAt: row.observed_at,
    updatedAt: row.updated_at,
  };
}

export function useLiveWeather(city: string) {
  const supabase = createClerkSupabaseClient();
  const cityKey = normalizeCityKey(city || "");
  const [weather, setWeather] = useState<LiveWeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSnapshot = useCallback(async () => {
    if (!cityKey) {
      setWeather(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("weather_snapshots")
      .select("*")
      .eq("city_key", cityKey)
      .maybeSingle();

    if (fetchError) {
      console.error("[useLiveWeather] fetch error:", fetchError.message);
      setError(true);
      setLoading(false);
      return;
    }

    setWeather(data ? rowToSnapshot(data as WeatherRow) : null);
    setError(false);
    setLoading(false);
  }, [cityKey, supabase]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (!cityKey) return;

    const channelName = `weather:${cityKey}:${Date.now()}:${Math.random()
      .toString(36)
      .slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weather_snapshots",
          filter: `city_key=eq.${cityKey}`,
        },
        (payload) => {
          if (payload.new) {
            setWeather(rowToSnapshot(payload.new as WeatherRow));
            setLoading(false);
            setError(false);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [cityKey, supabase]);

  return { weather, loading, error, refetch: fetchSnapshot };
}
