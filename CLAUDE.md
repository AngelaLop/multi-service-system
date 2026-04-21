# CLAUDE.md

## Project
Assignment 4 for MPCS 51238 (Design, Build, Ship, Spring 2026).

This repository contains a multi-service wellness planner:

- `apps/web` is a Next.js frontend deployed to Vercel
- `apps/worker` is a Node.js background worker deployed to Railway
- Supabase stores planner data, live weather snapshots, FX data, and pushes Realtime updates

## Product
The app helps users plan their day around live outdoor conditions and exchange-rate changes.

Core user flow:

1. Sign up / sign in with Clerk
2. Choose a city and wellness focus in Settings
3. Add planner events and journal entries
4. See live weather and USD/COP data update in the dashboard without refreshing

## Architecture

External APIs:

- OpenWeatherMap current weather + forecast
- Open Exchange Rates / ER API for USD base rates
- Frankfurter for recent FX history

Data flow:

1. Railway worker polls external APIs on an interval
2. Worker normalizes data and upserts into Supabase
3. Supabase Realtime publishes row changes
4. Next.js frontend performs initial reads, then subscribes to live table updates

## Supabase tables

User-owned tables with RLS:

- `events`
- `journal_entries`
- `user_settings`

Public read / worker write tables:

- `weather_snapshots`
- `fx_rates`

## Environment variables

### Web (`apps/web`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (legacy fallback, optional)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

### Worker (`apps/worker`)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENWEATHERMAP_API_KEY`
- `DEFAULT_CITIES` (optional, comma separated)
- `POLL_INTERVAL_MS` (optional)

## Notes for agents

- The Week 4 requirement is the worker -> Supabase -> Realtime path. Do not reintroduce direct frontend fetches for the primary live cards.
- Preserve existing planner/journal functionality unless it directly conflicts with the Assignment 4 architecture.
- Prefer simple, explicit data models over abstraction-heavy refactors.
