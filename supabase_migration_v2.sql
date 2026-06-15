-- Run this in Supabase → SQL Editor → New Query → Run
-- Adds an "initials" column for identifying who submitted each recipe,
-- and backfills all existing recipes with "DAM".

alter table recipes add column if not exists initials text default 'DAM';

update recipes set initials = 'DAM' where initials is null;

alter table recipes alter column initials set not null;
