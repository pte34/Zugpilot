-- ZugPilot: Tabellen fuer die optionale Supabase-Sync.
-- Ausfuehren im Supabase-Projekt unter "SQL Editor" -> "New query".
--
-- Ohne diese Tabellen (und ohne VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
-- laeuft ZugPilot einfach weiter rein lokal ueber localStorage - siehe
-- src/lib/supabaseClient.ts.

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  from_station text not null,
  to_station text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.history_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  chosen_at timestamptz not null default now(),
  weekday smallint not null,
  query_minute_of_day smallint not null,
  departure_iso text not null,
  departure_minute_of_day smallint not null
);

create index if not exists history_entries_destination_id_idx on public.history_entries (destination_id);

-- Row Level Security: jede:r sieht und aendert ausschliesslich die eigenen Zeilen.
alter table public.destinations enable row level security;
alter table public.history_entries enable row level security;

create policy "Destinations: eigene Zeilen lesen" on public.destinations
  for select using (auth.uid() = user_id);
create policy "Destinations: eigene Zeilen anlegen" on public.destinations
  for insert with check (auth.uid() = user_id);
create policy "Destinations: eigene Zeilen loeschen" on public.destinations
  for delete using (auth.uid() = user_id);

create policy "History: eigene Zeilen lesen" on public.history_entries
  for select using (auth.uid() = user_id);
create policy "History: eigene Zeilen anlegen" on public.history_entries
  for insert with check (auth.uid() = user_id);
