create extension if not exists pgcrypto;

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  description text default '',
  date text not null,
  start_time text not null,
  end_time text not null,
  color text not null default 'blue',
  completed boolean default false,
  created_at timestamptz default now()
);

alter table events enable row level security;

drop policy if exists "Users can view own events" on events;
create policy "Users can view own events"
  on events for select
  using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can insert own events" on events;
create policy "Users can insert own events"
  on events for insert
  with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can update own events" on events;
create policy "Users can update own events"
  on events for update
  using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can delete own events" on events;
create policy "Users can delete own events"
  on events for delete
  using (user_id = auth.jwt() ->> 'sub');

create table if not exists journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  date text not null,
  mood text not null,
  emotion text not null,
  tags text[] default '{}',
  text text default '',
  weather_city text,
  weather_temp numeric,
  weather_description text,
  weather_icon text,
  weather_outdoor_score text
    check (weather_outdoor_score in ('good', 'caution', 'rest')),
  created_at timestamptz default now()
);

alter table journal_entries add column if not exists weather_city text;
alter table journal_entries add column if not exists weather_temp numeric;
alter table journal_entries add column if not exists weather_description text;
alter table journal_entries add column if not exists weather_icon text;
alter table journal_entries add column if not exists weather_outdoor_score text;

alter table journal_entries
  drop constraint if exists journal_entries_weather_outdoor_score_check;

alter table journal_entries
  add constraint journal_entries_weather_outdoor_score_check
  check (weather_outdoor_score is null or weather_outdoor_score in ('good', 'caution', 'rest'));

alter table journal_entries enable row level security;

drop policy if exists "Users can view own journal entries" on journal_entries;
create policy "Users can view own journal entries"
  on journal_entries for select
  using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can insert own journal entries" on journal_entries;
create policy "Users can insert own journal entries"
  on journal_entries for insert
  with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can delete own journal entries" on journal_entries;
create policy "Users can delete own journal entries"
  on journal_entries for delete
  using (user_id = auth.jwt() ->> 'sub');

create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  theme text default 'zen-dark',
  weather_city text default 'Chicago',
  wellness_focus text not null default 'balanced'
    check (wellness_focus in ('balanced', 'outdoor', 'indoors')),
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;

drop policy if exists "Users can view own settings" on user_settings;
create policy "Users can view own settings"
  on user_settings for select
  using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can insert own settings" on user_settings;
create policy "Users can insert own settings"
  on user_settings for insert
  with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can update own settings" on user_settings;
create policy "Users can update own settings"
  on user_settings for update
  using (user_id = auth.jwt() ->> 'sub');

create table if not exists weather_snapshots (
  city_key text primary key,
  display_city text not null,
  temp numeric not null,
  description text not null,
  icon text not null,
  feels_like numeric,
  humidity integer,
  wind_speed numeric,
  temp_min numeric,
  temp_max numeric,
  forecast jsonb not null default '[]'::jsonb,
  wellness_summary text not null default '',
  outdoor_score text not null default 'good'
    check (outdoor_score in ('good', 'caution', 'rest')),
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table weather_snapshots enable row level security;

drop policy if exists "Public can view weather snapshots" on weather_snapshots;
create policy "Public can view weather snapshots"
  on weather_snapshots for select
  using (true);

create table if not exists fx_rates (
  pair_key text primary key,
  base_currency text not null,
  quote_currency text not null,
  rate numeric not null,
  trend jsonb not null default '[]'::jsonb,
  direction text not null default 'flat'
    check (direction in ('up', 'down', 'flat')),
  summary text not null default '',
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table fx_rates enable row level security;

drop policy if exists "Public can view fx rates" on fx_rates;
create policy "Public can view fx rates"
  on fx_rates for select
  using (true);
