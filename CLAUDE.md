# CLAUDE.md

## Project
Assignment 4 for MPCS 51238 (Design, Build, Ship, Spring 2026).

This repository contains a multi-service wellness planner:

- `apps/web` is a `Next.js` + `Tailwind CSS` frontend deployed to Vercel
- `apps/worker` is a Node.js background worker deployed to Railway
- Supabase stores planner data, live weather snapshots, FX data, and pushes Realtime updates

Repository layout:

- `apps/web`
- `apps/worker`
- `supabase-schema.sql`
- `README.md`
- `CLAUDE.md`

Public repository:

- `https://github.com/AngelaLop/multi-service-system`

Live deployment:

- Frontend: `https://web-two-omega-60.vercel.app`
- Worker: Railway service in `weatherwise-worker` project

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

Deployment targets:

- Vercel for `apps/web`
- Railway for `apps/worker`
- Supabase for database, auth integration, RLS, and Realtime

## Supabase tables

User-owned tables with RLS:

- `events`
- `journal_entries`
- `user_settings`

Public read / worker write tables:

- `weather_snapshots`
- `fx_rates`

Realtime is enabled for:

- `weather_snapshots`
- `fx_rates`

Auth + personalization:

- Clerk handles sign-up and sign-in
- Supabase stores user-owned planner and settings data behind RLS
- Each user can personalize city and wellness focus
- The dashboard content changes based on the logged-in user's preferences

## Environment variables

Local env files:

- `apps/web/.env.local`
- `apps/worker/.env`

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

Platform dashboards:

- The same web variables must exist in Vercel
- The same worker variables must exist in Railway

## Supabase MCP

Expected MCP setup command from the assignment:

- `claude mcp add --transport http supabase https://mcp.supabase.com/mcp`

This project's database schema is defined in `supabase-schema.sql`, and Realtime must be enabled on the worker-written tables.

## Submission-facing checklist

This repo is intended to satisfy the Week 4 requirements:

- monorepo with `apps/web` and `apps/worker`
- `Next.js` + `Tailwind CSS`
- Railway background worker polling external data
- Supabase storage + Realtime subscriptions
- auth with Clerk
- personalized user data and preferences
- `CLAUDE.md` architecture description
- public GitHub repo with commit history
- deployed frontend on Vercel
- deployed worker on Railway

Still verify before submission:

- classmates can sign up on the live Vercel URL
- the Railway worker is still healthy
- the Slack video reflection URL is posted
- multiple commits remain visible in GitHub history

## Notes for agents

- The Week 4 requirement is the worker -> Supabase -> Realtime path. Do not reintroduce direct frontend fetches for the primary live cards.
- Preserve existing planner/journal functionality unless it directly conflicts with the Assignment 4 architecture.
- Prefer simple, explicit data models over abstraction-heavy refactors.
