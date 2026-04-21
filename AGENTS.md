# AGENTS.md

## Project
Multi-service wellness planner for Assignment 4.

## Services
- `apps/web`: Next.js frontend on Vercel
- `apps/worker`: Node.js polling worker on Railway

## Core rule
The live weather and FX cards must read from Supabase and update via Supabase Realtime. The frontend should not call external APIs directly for those cards.

## Data model
- User tables: `events`, `journal_entries`, `user_settings`
- Live tables: `weather_snapshots`, `fx_rates`

## Workflow
- Keep edits pragmatic and local to the feature being changed.
- Favor readable code and direct SQL / hook patterns.
- Preserve Clerk auth and Supabase RLS for user-owned data.
