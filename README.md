# Weatherwise Planner

Assignment 4 system for MPCS 51238 (Design, Build, Ship, Spring 2026).

## What it is

Weatherwise Planner is a wellness-first planner that combines:

- personal scheduling and journaling
- live weather snapshots by user-selected city
- live USD/COP exchange-rate tracking
- Supabase Realtime updates in the dashboard

## Architecture

`External APIs -> Railway worker -> Supabase -> Next.js frontend`

- `apps/web`: Next.js + Tailwind + Clerk + Supabase
- `apps/worker`: Node.js polling worker for weather and FX data
- `supabase-schema.sql`: shared database schema for planner data and live data

## Local setup

### Web

1. Copy `apps/web/.env.example` to `apps/web/.env.local`
2. Fill in your Clerk and Supabase values
3. Run `npm install` inside `apps/web`
4. Run `npm run dev`

### Worker

1. Copy `apps/worker/.env.example` to `apps/worker/.env`
2. Fill in your Supabase and OpenWeatherMap values
3. Run `npm install` inside `apps/worker`
4. Run `npm run dev`

## Deployment targets

- Vercel: `apps/web`
- Railway: `apps/worker`

## Supabase setup

1. Run `supabase-schema.sql`
2. Enable Realtime for:
   - `weather_snapshots`
   - `fx_rates`

## Notes

- The live weather and FX cards no longer fetch external APIs directly from the frontend.
- Those cards now read from Supabase and subscribe to Realtime updates.
