import type { MoodLevel } from "@/types";

export const MOOD_CONFIG: Record<MoodLevel, {
  label: string;
  color: string;
  emotions: string[];
}> = {
  great: {
    label: "Great",
    color: "var(--event-green-border)",
    emotions: ["Excited", "Grateful", "Proud", "Peaceful", "Inspired", "Joyful"],
  },
  good: {
    label: "Good",
    color: "var(--event-blue-border)",
    emotions: ["Happy", "Hopeful", "Content", "Confident", "Relaxed", "Motivated"],
  },
  okay: {
    label: "Okay",
    color: "var(--event-amber-border)",
    emotions: ["Calm", "Indifferent", "Distracted", "Bored", "Tired", "Uncertain"],
  },
  low: {
    label: "Low",
    color: "var(--event-purple-border)",
    emotions: ["Anxious", "Sad", "Lonely", "Overwhelmed", "Frustrated", "Insecure"],
  },
  rough: {
    label: "Rough",
    color: "var(--event-red-border)",
    emotions: ["Angry", "Hopeless", "Exhausted", "Panicked", "Grieving", "Numb"],
  },
};

export const MOOD_LEVELS: MoodLevel[] = ["great", "good", "okay", "low", "rough"];

export const CONTEXT_TAGS = [
  "School", "Work", "Health", "Relationships", "Money",
  "Sleep", "Exercise", "Family", "Social", "Weather",
  "Creativity", "Self-care",
];

export function moodToNumber(mood: MoodLevel): number {
  const map: Record<MoodLevel, number> = { great: 5, good: 4, okay: 3, low: 2, rough: 1 };
  return map[mood];
}
