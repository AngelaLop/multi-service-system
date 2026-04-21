"use client";

import type { MoodLevel } from "@/types";

// Hand-drawn, line-art wellness figures — stroke-based, no fills
const MOOD_PATHS: Record<MoodLevel, string[]> = {
  great: [
    // figure with arms raised in celebration
    "M24 14a4 4 0 1 0 0-0.01", // head
    "M24 18v12", // body
    "M24 22l-8-8M24 22l8-8", // arms raised V
    "M24 30l-6 10M24 30l6 10", // legs
    "M24 6v-2M18 8l-1.5-1.5M30 8l1.5-1.5", // radiance
  ],
  good: [
    // person walking peacefully
    "M24 12a4 4 0 1 0 0-0.01", // head
    "M24 16v10", // body
    "M24 20l-5 4M24 20l5-2", // arms relaxed
    "M24 26l-5 12M24 26l6 10", // legs stride
    "M8 42q16-6 32 0", // gentle path
  ],
  okay: [
    // seated meditation pose
    "M24 12a4 4 0 1 0 0-0.01", // head
    "M24 16v10", // torso
    "M24 20l-8 6M24 20l8 6", // arms on knees
    "M16 34q8-4 16 0", // crossed legs
    "M12 38h24", // mat
  ],
  low: [
    // hunched sitting figure
    "M22 14a4 4 0 1 0 0-0.01", // head drooped
    "M24 18q2 6 0 12", // curved spine
    "M20 24q-4 4-2 8M28 24q2 4 0 8", // arms around knees
    "M18 32q6 4 12 0", // bent legs
    "M12 38h24", // surface
  ],
  rough: [
    // curled up figure with storm cloud
    "M16 10q0-4 4-4q2-2 6 0q4 0 4 4q2 0 2 2h-18q0-2 2-2", // cloud
    "M20 14v3M28 14v3", // rain
    "M22 24a3.5 3.5 0 1 0 0-0.01", // head tucked
    "M25 26q4 4 2 10", // body curled
    "M18 36q4-2 9 0M19 28q-3 2-2 6", // knees + arms
  ],
};

// Abstract symbols for specific emotions
const EMOTION_PATHS: Record<string, string[]> = {
  // Great emotions
  Excited: ["M12 24l4-8 4 8 4-8 4 8 4-8 4 8"], // zigzag energy
  Grateful: ["M14 20q10-8 20 0M14 28q10-8 20 0"], // open hands
  Proud: ["M16 36l8-24 8 24M24 12l4-4"], // mountain + flag
  Peaceful: ["M24 32q-8-4-6-12q6 4 6-4q0 8 6 4q2 8-6 12"], // lotus
  Inspired: ["M24 18a6 6 0 1 0 0-0.01M24 8v-4M16 10l-2-2M32 10l2-2"], // bulb
  Joyful: ["M24 12v-8M24 36v-8M12 24h-8M36 24h-8M16 16l-4-4M32 16l4-4M16 32l-4 4M32 32l4 4"], // starburst
  // Good emotions
  Happy: ["M24 24a8 8 0 1 0 0-0.01M24 12v-4M36 24h4M24 36v4M12 24h-4"], // sun
  Hopeful: ["M8 32h32M24 32v-8M16 28l8-8 8 8"], // sunrise
  Content: ["M24 8q8 8 0 32q-8-24 0-32"], // leaf
  Confident: ["M24 8l12 16-12 16-12-16z"], // shield
  Relaxed: ["M8 20q8-8 16 0q8 8 16 0"], // wave
  Motivated: ["M24 36v-28M16 16l8-8 8 8"], // arrow up
  // Okay emotions
  Calm: ["M8 20q8-4 16 0q8 4 16 0M8 28q8-4 16 0q8 4 16 0"], // still water
  Indifferent: ["M12 24h24"], // dash
  Distracted: ["M18 18a2 2 0 1 0 0-0.01M30 18a2 2 0 1 0 0-0.01M24 30a2 2 0 1 0 0-0.01"], // dots
  Bored: ["M24 24a10 10 0 1 0 0-0.01"], // circle
  Tired: ["M28 24a8 8 0 1 1-4-7"], // crescent
  Uncertain: ["M20 16q0-4 4-4q4 0 4 4q0 4-4 6M24 30v0.01"], // question
  // Low emotions
  Anxious: ["M24 12q-2 4-1 8q2 4 0 8q-2 4-1 8"], // spiral-ish
  Sad: ["M24 12q-4 12 0 24q4-12 0-24"], // teardrop
  Lonely: ["M24 24a3 3 0 1 0 0-0.01"], // single dot
  Overwhelmed: ["M16 20q4-4 8 0q4 4 8 0M16 28q4-4 8 0q4 4 8 0"], // tangled
  Frustrated: ["M10 20l4 4 4-4 4 4 4-4 4 4 4-4 4 4"], // zigzag
  Insecure: ["M24 12a12 12 0 0 1 0 24M24 36a12 12 0 0 1-8-12"], // cracked
  // Rough emotions
  Angry: ["M24 36q-6-8-4-16q2-4 4-4q2 0 4 4q2 8-4 16"], // flame
  Hopeless: ["M24 8v28M16 28l8 8 8-8"], // arrow down
  Exhausted: ["M16 12h16v24h-16zM16 32h16"], // empty battery
  Panicked: ["M24 8v16M24 30v0.01"], // exclamation
  Grieving: ["M24 36v-20M24 16q-6-4-8 0M20 12q-2-4 0-4"], // wilted
  Numb: ["M14 14h20v20h-20z"], // empty square
};

interface MoodIconProps {
  mood: MoodLevel;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MoodIcon({ mood, size = 32, className = "", style }: MoodIconProps) {
  const paths = MOOD_PATHS[mood];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role="img"
      aria-label={mood}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

interface EmotionIconProps {
  emotion: string;
  size?: number;
  className?: string;
}

export function EmotionIcon({ emotion, size = 16, className = "" }: EmotionIconProps) {
  const paths = EMOTION_PATHS[emotion];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={emotion}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
