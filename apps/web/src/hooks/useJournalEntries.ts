"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import type { JournalEntry, MoodLevel, WeatherOutdoorScore } from "@/types";

interface JournalRow {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  emotion: string;
  tags: string[];
  text: string;
  created_at: string;
  weather_city?: string | null;
  weather_temp?: number | null;
  weather_description?: string | null;
  weather_icon?: string | null;
  weather_outdoor_score?: WeatherOutdoorScore | null;
}

function rowToEntry(row: JournalRow): JournalEntry {
  const hasWeather =
    !!row.weather_city ||
    row.weather_temp != null ||
    !!row.weather_description ||
    !!row.weather_icon ||
    !!row.weather_outdoor_score;

  return {
    id: row.id,
    date: row.date,
    mood: row.mood as MoodLevel,
    emotion: row.emotion,
    tags: row.tags || [],
    text: row.text || "",
    createdAt: row.created_at,
    weather: hasWeather
      ? {
          city: row.weather_city ?? undefined,
          temperature: row.weather_temp != null ? Number(row.weather_temp) : undefined,
          description: row.weather_description ?? undefined,
          icon: row.weather_icon ?? undefined,
          outdoorScore: row.weather_outdoor_score ?? undefined,
        }
      : undefined,
  };
}

// Simple event bus so separate useJournalEntries instances stay in sync
const listeners = new Set<() => void>();
function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useJournalEntries() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[useJournalEntries] fetch error:", error.message);
    }
    if (data) {
      setEntries(data.map(rowToEntry));
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    listeners.add(fetchEntries);
    return () => {
      listeners.delete(fetchEntries);
    };
  }, [fetchEntries]);

  const addEntry = async (payload: Omit<JournalEntry, "id">) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        date: payload.date,
        mood: payload.mood,
        emotion: payload.emotion,
        tags: payload.tags,
        text: payload.text,
        created_at: payload.createdAt,
        weather_city: payload.weather?.city,
        weather_temp: payload.weather?.temperature,
        weather_description: payload.weather?.description,
        weather_icon: payload.weather?.icon,
        weather_outdoor_score: payload.weather?.outdoorScore,
      })
      .select()
      .single();

    if (error) {
      console.error("[useJournalEntries] insert error:", error.message);
      return;
    }
    if (data) {
      setEntries((prev) => [rowToEntry(data), ...prev]);
      notifyAll();
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) {
      console.error("[useJournalEntries] delete error:", error.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    notifyAll();
  };

  return { entries, loading, addEntry, deleteEntry, refetch: fetchEntries };
}
