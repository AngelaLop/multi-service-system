"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import { useUserSettings } from "@/hooks/useUserSettings";
import { themes } from "@/lib/themes";
import type { ThemeId, WellnessFocus } from "@/types";

const themeOrder: ThemeId[] = [
  "zen-dark",
  "morgen-dark",
  "morgen-light",
  "dyslexia",
  "high-contrast",
  "pastel",
];

const themeIcons: Record<ThemeId, string> = {
  "zen-dark": "M12 3v1m0 16v1M5 12H3m18 0h-2M7.05 7.05l-1.414-1.414m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  "morgen-dark": "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  "morgen-light": "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  dyslexia: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "high-contrast": "M13 10V3L4 14h7v7l9-11h-7z",
  pastel: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
};

export default function SettingsPage() {
  const { user } = useUser();
  const { settings, updateTheme, updateWeatherCity, updateWellnessFocus } = useUserSettings();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [cityDraft, setCityDraft] = useState(settings.weatherCity);
  const [citySaved, setCitySaved] = useState(false);

  const focusOptions: { value: WellnessFocus; label: string; description: string }[] = [
    {
      value: "balanced",
      label: "Balanced",
      description: "Mix indoor focus with outdoor breaks when conditions are supportive.",
    },
    {
      value: "outdoor",
      label: "Outdoor-first",
      description: "Prioritize walks, errands, and movement when the weather gives you a window.",
    },
    {
      value: "indoors",
      label: "Indoors-first",
      description: "Keep core work protected and use only short outdoor resets.",
    },
  ];

  async function handleSaveName() {
    if (!user) return;
    await user.update({ firstName, lastName });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  useEffect(() => {
    setCityDraft(settings.weatherCity);
  }, [settings.weatherCity]);

  async function handleSaveCity() {
    const nextCity = cityDraft.trim();
    if (!nextCity || nextCity === settings.weatherCity) return;
    await updateWeatherCity(nextCity);
    setCitySaved(true);
    setTimeout(() => setCitySaved(false), 2500);
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Profile
            </h2>
            <div
              className="p-4 rounded-xl space-y-4"
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                border: "var(--border-width) solid var(--border-color)",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "var(--border-width) solid var(--border-color-strong)",
                    }}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "var(--border-width) solid var(--border-color-strong)",
                    }}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveName}
                className="px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {nameSaved ? "Saved!" : "Save Name"}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Theme
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeOrder.map((id) => {
                const theme = themes[id];
                const isActive = settings.theme === id;
                return (
                  <button
                    key={id}
                    onClick={() => updateTheme(id)}
                    className="flex items-start gap-3 p-4 text-left transition-all"
                    style={{
                      background: isActive ? "var(--bg-tertiary)" : "var(--bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: isActive
                        ? "2px solid var(--accent-start)"
                        : "var(--border-width) solid var(--border-color)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                      style={{
                        background: theme.cssVars["--bg-primary"],
                        border: `1px solid ${theme.cssVars["--border-color-strong"]}`,
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={theme.cssVars["--text-primary"]}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={themeIcons[id]} />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {theme.name}
                        {isActive && (
                          <span
                            className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-normal"
                            style={{
                              background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                              color: "white",
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {theme.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Live briefing
            </h2>
            <div
              className="p-4 rounded-xl space-y-4"
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                border: "var(--border-width) solid var(--border-color)",
              }}
            >
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  City
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={cityDraft}
                    onChange={(e) => setCityDraft(e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      borderRadius: "var(--radius-md)",
                      border: "var(--border-width) solid var(--border-color-strong)",
                    }}
                    placeholder="e.g. Chicago, Miami, Bogota, CO"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
                      Use a city name or `City, Country Code`. After saving, the worker may take up to 60 seconds to sync the new snapshot.
                    </p>
                    <button
                      onClick={handleSaveCity}
                      disabled={!cityDraft.trim() || cityDraft.trim() === settings.weatherCity}
                      className="shrink-0 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      {citySaved ? "Saved" : "Save City"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Wellness focus
                </label>
                <div className="grid gap-2">
                  {focusOptions.map((option) => {
                    const isActive = settings.wellnessFocus === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateWellnessFocus(option.value)}
                        className="p-3 text-left transition-colors"
                        style={{
                          background: isActive ? "var(--bg-tertiary)" : "transparent",
                          borderRadius: "var(--radius-md)",
                          border: isActive
                            ? "2px solid var(--accent-start)"
                            : "var(--border-width) solid var(--border-color)",
                        }}
                      >
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {option.label}
                        </div>
                        <div className="mt-1 text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                border: "var(--border-width) solid var(--border-color)",
                color: "var(--text-tertiary)",
              }}
            >
              <p>
                Your worker watches the city in this screen, stores live snapshots in Supabase,
                and your dashboard updates from Realtime without a page refresh.
              </p>
              <p className="mt-3">
                If Chicago works and a new city does not appear immediately, that usually means the worker has not completed its next poll yet or the city needs a clearer format like `Bogota, CO`.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
