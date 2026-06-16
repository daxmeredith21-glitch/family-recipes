-- Run this in Supabase → SQL Editor → New Query → Run
-- Adds update and delete permissions so recipes can be edited and removed

create policy "Anyone can update recipes"
  on recipes for update
  using (true)
  with check (true);

create policy "Anyone can delete recipes"
  on recipes for delete
  using (true);
