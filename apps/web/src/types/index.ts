export interface PlannerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: EventColor;
  completed: boolean;
}

export type EventColor = "blue" | "red" | "green" | "purple" | "amber";

export type NewsSource = "nytimes" | "ft" | "eltiempo";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  pubDate: string;
  source: NewsSource;
}

// Journal & Emotion Check-in
export type MoodLevel = "great" | "good" | "okay" | "low" | "rough";
export type WeatherOutdoorScore = "good" | "caution" | "rest";

export interface JournalWeatherContext {
  city?: string;
  temperature?: number;
  description?: string;
  icon?: string;
  outdoorScore?: WeatherOutdoorScore;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  emotion: string;
  tags: string[];
  text: string;
  createdAt: string; // ISO timestamp
  weather?: JournalWeatherContext;
}

export type ThemeId =
  | "zen-dark"
  | "morgen-dark"
  | "morgen-light"
  | "dyslexia"
  | "high-contrast"
  | "pastel";

export type WellnessFocus = "balanced" | "outdoor" | "indoors";

export interface SavedMovie {
  id: string;
  userId: string;
  tmdbId: string;
  title: string;
  director: string;
  releaseDate: string;
  posterUrl: string;
  tmdbRating: number;
  rating: number;
  notes: string;
  recommendedBy: string;
  watched: boolean;
  createdAt: string;
}

export interface MovieSearchResult {
  tmdbId: string;
  title: string;
  releaseDate: string;
  posterUrl: string;
  overview: string;
  tmdbRating: number;
  genreIds: number[];
}

export interface UserSettings {
  theme: ThemeId;
  weatherCity: string;
  wellnessFocus: WellnessFocus;
}

export interface ForecastItem {
  date: string;
  temp: number;
  icon: string;
  description: string;
}

export interface LiveWeatherSnapshot {
  cityKey: string;
  displayCity: string;
  temp: number;
  description: string;
  icon: string;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  tempMin?: number;
  tempMax?: number;
  forecast: ForecastItem[];
  wellnessSummary: string;
  outdoorScore: WeatherOutdoorScore;
  observedAt: string;
  updatedAt: string;
}

export interface FxRateSnapshot {
  pairKey: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  trend: number[];
  direction: "up" | "down" | "flat";
  summary: string;
  observedAt: string;
  updatedAt: string;
}

export interface PlannerState {
  selectedDate: string;
}

export type PlannerAction =
  | { type: "SET_DATE"; payload: string };
