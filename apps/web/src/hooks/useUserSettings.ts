"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { applyTheme } from "@/lib/themes";
import type { ThemeId, UserSettings, WellnessFocus } from "@/types";

export function useUserSettings() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "zen-dark",
    weatherCity: "Chicago",
    wellnessFocus: "balanced",
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .single();

    if (error) {
      console.error("[useUserSettings] fetch error:", error.message, "- creating defaults");
      // No settings row yet — create one with defaults
      const { data: newData, error: insertErr } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          theme: "zen-dark",
          weather_city: "Chicago",
          wellness_focus: "balanced",
        })
        .select()
        .single();

      if (insertErr) {
        console.error("[useUserSettings] insert error:", insertErr.message);
      }
      if (newData) {
        const s = {
          theme: newData.theme as ThemeId,
          weatherCity: newData.weather_city,
          wellnessFocus: (newData.wellness_focus || "balanced") as WellnessFocus,
        };
        setSettings(s);
        applyTheme(s.theme);
      }
    } else if (data) {
      const s = {
        theme: data.theme as ThemeId,
        weatherCity: data.weather_city,
        wellnessFocus: (data.wellness_focus || "balanced") as WellnessFocus,
      };
      setSettings(s);
      applyTheme(s.theme);
    }

    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply default theme on mount (before settings load)
  useEffect(() => {
    applyTheme("zen-dark");
  }, []);

  const updateTheme = async (theme: ThemeId) => {
    applyTheme(theme);
    setSettings((prev) => ({ ...prev, theme }));
    const { error } = await supabase
      .from("user_settings")
      .update({ theme, updated_at: new Date().toISOString() })
      .eq("user_id", user?.id);
    if (error) console.error("[useUserSettings] update theme error:", error.message);
  };

  const updateWeatherCity = async (weatherCity: string) => {
    setSettings((prev) => ({ ...prev, weatherCity }));
    const { error } = await supabase
      .from("user_settings")
      .update({ weather_city: weatherCity, updated_at: new Date().toISOString() })
      .eq("user_id", user?.id);
    if (error) console.error("[useUserSettings] update city error:", error.message);
  };

  const updateWellnessFocus = async (wellnessFocus: WellnessFocus) => {
    setSettings((prev) => ({ ...prev, wellnessFocus }));
    const { error } = await supabase
      .from("user_settings")
      .update({
        wellness_focus: wellnessFocus,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user?.id);
    if (error) console.error("[useUserSettings] update focus error:", error.message);
  };

  return { settings, loading, updateTheme, updateWeatherCity, updateWellnessFocus };
}
