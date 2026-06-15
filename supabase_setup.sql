-- Run this in Supabase → SQL Editor → New Query
-- Then click "Run"

create table recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  submitted_by text not null,
  initials text not null default 'DAM',
  serves text,
  time text,
  ingredients jsonb default '[]',
  steps jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- Allow anyone with the anon key to read and insert
-- (no login required — family sharing via link)
alter table recipes enable row level security;

create policy "Anyone can read recipes"
  on recipes for select
  using (true);

create policy "Anyone can add recipes"
  on recipes for insert
  with check (true);
