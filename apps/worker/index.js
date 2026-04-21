import { createClient } from "@supabase/supabase-js";

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || "60000");
const DEFAULT_CITIES = (process.env.DEFAULT_CITIES || "Chicago")
  .split(",")
  .map((city) => city.trim())
  .filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function normalizeCityKey(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function looksWet(description = "", icon = "") {
  return /(rain|storm|drizzle|snow|shower|thunder)/i.test(description) || /^(09|10|11|13)/.test(icon);
}

function summarizeWeather(snapshot) {
  const rainyNow = looksWet(snapshot.description, snapshot.icon);
  const rainAhead = Array.isArray(snapshot.forecast)
    ? snapshot.forecast.some((item) => looksWet(item.description, item.icon))
    : false;
  const veryHot = snapshot.temp >= 31;
  const cold = snapshot.temp <= 3;
  const windy = (snapshot.windSpeed || 0) >= 9;
  const muggy = (snapshot.humidity || 0) >= 85;

  if (rainyNow || veryHot || cold) {
    return {
      outdoorScore: "rest",
      summary: rainyNow
        ? "Wet conditions right now. Keep outdoor tasks short and move focus blocks inside."
        : veryHot
          ? "Heat is high. Plan walks early and keep heavier activity indoors."
          : "Cold air outside. Good day for indoor focus with short outdoor breaks.",
    };
  }

  if (rainAhead || windy || muggy || snapshot.temp >= 27) {
    return {
      outdoorScore: "caution",
      summary: rainAhead
        ? "Rain is in the forecast. Keep outdoor tasks flexible and have an indoor backup."
        : "Conditions are usable but not ideal. Keep outdoor tasks flexible.",
    };
  }

  return {
    outdoorScore: "good",
    summary: "Comfortable outdoor window. Good time for walks, errands, or a reset break.",
  };
}

function summarizeFx(currentRate, trend) {
  if (!Array.isArray(trend) || trend.length < 2) {
    return { direction: "flat", summary: "USD/COP updated from the latest market snapshot." };
  }

  const start = Number(trend[0]);
  const end = Number(currentRate);
  const delta = end - start;

  if (Math.abs(delta) < 0.5) {
    return { direction: "flat", summary: "USD/COP is roughly flat versus the 7-day start." };
  }

  return delta > 0
    ? { direction: "up", summary: "USD/COP is trending up versus the 7-day start." }
    : { direction: "down", summary: "USD/COP is trending down versus the 7-day start." };
}

function buildMockWeather(city) {
  const observedAt = new Date().toISOString();
  const temp = 19 + (new Date().getMinutes() % 5);
  const snapshot = {
    cityKey: normalizeCityKey(city),
    displayCity: city,
    temp,
    description: "partly cloudy",
    icon: "02d",
    feelsLike: temp - 1,
    humidity: 60,
    windSpeed: 3.5,
    tempMin: temp - 3,
    tempMax: temp + 2,
    forecast: [
      { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), temp: temp + 1, icon: "02d", description: "light clouds" },
      { date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), temp: temp + 2, icon: "01d", description: "clear sky" },
      { date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), temp: temp - 1, icon: "03d", description: "scattered clouds" },
      { date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10), temp, icon: "10d", description: "light rain" },
    ],
    observedAt,
    updatedAt: observedAt,
  };
  return { ...snapshot, ...summarizeWeather(snapshot) };
}

async function getTrackedCities() {
  const { data, error } = await supabase
    .from("user_settings")
    .select("weather_city");

  if (error) {
    console.error("[worker] failed to load user cities:", error.message);
  }

  const cities = new Set(DEFAULT_CITIES);
  for (const row of data || []) {
    if (row.weather_city?.trim()) {
      cities.add(row.weather_city.trim());
    }
  }
  return [...cities];
}

async function fetchWeatherSnapshot(city) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return buildMockWeather(city);
  }

  const encodedCity = encodeURIComponent(city);
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=metric&appid=${apiKey}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=metric&appid=${apiKey}`),
  ]);

  if (!currentRes.ok) {
    throw new Error(`weather fetch failed for ${city}: ${currentRes.status}`);
  }

  const current = await currentRes.json();
  const forecastData = forecastRes.ok ? await forecastRes.json() : { list: [] };
  const dailyMap = new Map();

  for (const item of forecastData.list || []) {
    const [date, time] = String(item.dt_txt || "").split(" ");
    const hour = Number((time || "00:00:00").split(":")[0]);
    if (!date) continue;
    if (hour === 12 || !dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        temp: Math.round(item.main.temp),
        icon: item.weather?.[0]?.icon || "02d",
        description: item.weather?.[0]?.description || "forecast",
      });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const forecast = [...dailyMap.values()].filter((item) => item.date !== today).slice(0, 4);
  const observedAt = new Date().toISOString();
  const snapshot = {
    cityKey: normalizeCityKey(city),
    displayCity: current.sys?.country ? `${current.name}, ${current.sys.country}` : current.name || city,
    temp: Number(current.main.temp),
    description: current.weather?.[0]?.description || "weather update",
    icon: current.weather?.[0]?.icon || "02d",
    feelsLike: Number(current.main.feels_like),
    humidity: Number(current.main.humidity),
    windSpeed: Number(current.wind?.speed || 0),
    tempMin: Number(current.main.temp_min),
    tempMax: Number(current.main.temp_max),
    forecast,
    observedAt,
    updatedAt: observedAt,
  };

  return { ...snapshot, ...summarizeWeather(snapshot) };
}

async function syncWeather() {
  const cities = await getTrackedCities();
  const snapshots = [];

  for (const city of cities) {
    try {
      const snapshot = await fetchWeatherSnapshot(city);
      snapshots.push({
        city_key: snapshot.cityKey,
        display_city: snapshot.displayCity,
        temp: snapshot.temp,
        description: snapshot.description,
        icon: snapshot.icon,
        feels_like: snapshot.feelsLike,
        humidity: snapshot.humidity,
        wind_speed: snapshot.windSpeed,
        temp_min: snapshot.tempMin,
        temp_max: snapshot.tempMax,
        forecast: snapshot.forecast,
        wellness_summary: snapshot.summary,
        outdoor_score: snapshot.outdoorScore,
        observed_at: snapshot.observedAt,
        updated_at: snapshot.updatedAt,
      });
    } catch (error) {
      console.error("[worker] weather sync failed for", city, error.message);
    }
  }

  if (snapshots.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("weather_snapshots")
    .upsert(snapshots, { onConflict: "city_key" });

  if (error) {
    console.error("[worker] weather upsert failed:", error.message);
    return;
  }

  console.log(`[worker] synced weather for ${snapshots.length} city(s)`);
}

async function syncFx() {
  let currentRate = 4185.5;
  let trend = [4150, 4170, 4160, 4180, 4175, 4190, 4185];

  try {
    const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
    if (rateRes.ok) {
      const rateData = await rateRes.json();
      if (rateData.rates?.COP) {
        currentRate = Number(rateData.rates.COP);
      }
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const from = weekAgo.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    const histRes = await fetch(
      `https://api.frankfurter.dev/v2/rates?from=${from}&to=${to}&base=USD&quotes=COP`
    );
    if (histRes.ok) {
      const histData = await histRes.json();
      if (Array.isArray(histData)) {
        const orderedTrend = histData
          .filter((row) => row.base === "USD" && row.quote === "COP")
          .sort((left, right) => String(left.date).localeCompare(String(right.date)))
          .map((row) => Number(row.rate))
          .filter((value) => Number.isFinite(value));

        if (orderedTrend.length > 0) {
          const lastHistoricalRate = orderedTrend[orderedTrend.length - 1];
          if (Math.abs(lastHistoricalRate - currentRate) > 0.0001) {
            orderedTrend.push(currentRate);
          } else {
            orderedTrend[orderedTrend.length - 1] = currentRate;
          }
          trend = orderedTrend;
        }
      }
    }
  } catch (error) {
    console.error("[worker] fx fetch failed, using fallback:", error.message);
  }

  if (!Array.isArray(trend) || trend.length < 2) {
    trend = Array.from({ length: 7 }, (_, index) => currentRate - (6 - index) * 2);
  }

  const summary = summarizeFx(currentRate, trend);
  const observedAt = new Date().toISOString();
  const { error } = await supabase.from("fx_rates").upsert(
    {
      pair_key: "usd_cop",
      base_currency: "USD",
      quote_currency: "COP",
      rate: currentRate,
      trend,
      direction: summary.direction,
      summary: summary.summary,
      observed_at: observedAt,
      updated_at: observedAt,
    },
    { onConflict: "pair_key" }
  );

  if (error) {
    console.error("[worker] fx upsert failed:", error.message);
    return;
  }

  console.log("[worker] synced USD/COP");
}

async function syncOnce() {
  console.log("[worker] sync start", new Date().toISOString());
  await Promise.all([syncWeather(), syncFx()]);
  console.log("[worker] sync complete", new Date().toISOString());
}

syncOnce().catch((error) => {
  console.error("[worker] initial sync failed:", error);
});

setInterval(() => {
  syncOnce().catch((error) => {
    console.error("[worker] scheduled sync failed:", error);
  });
}, POLL_INTERVAL_MS);
