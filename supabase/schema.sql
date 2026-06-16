-- Voyage — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → Run.

-- ---------------------------------------------------------------------------
-- Table: entries
-- ---------------------------------------------------------------------------
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  notes text not null default '' check (char_length(notes) <= 1000),
  latitude double precision,
  longitude double precision,
  place_name text,
  photo_url text,
  photo_path text,
  weather jsonb,
  trip_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_id_trip_date_idx
  on public.entries (user_id, trip_date desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: every user can only read/write their own rows.
-- ---------------------------------------------------------------------------
alter table public.entries enable row level security;

create policy "Users read own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users update own entries"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for entry photos.
-- Photos live under a `<user-id>/...` path prefix so per-user policies apply.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('entry-photos', 'entry-photos', true)
on conflict (id) do nothing;

create policy "Public read entry photos"
  on storage.objects for select
  using (bucket_id = 'entry-photos');

create policy "Users upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
