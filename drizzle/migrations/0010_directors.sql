-- Migration: add is_director boolean to team_members
-- Run via: supabase db push  OR  paste into Supabase SQL editor

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS is_director BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed flag for anyone already marked as a director-level role
UPDATE team_members
  SET is_director = TRUE
  WHERE role_title ILIKE '%director%'
    OR role_title ILIKE '%ceo%'
    OR role_title ILIKE '%cto%'
    OR role_title ILIKE '%coo%'
    OR role_title ILIKE '%founder%';

-- Grant SELECT on the new column to the anon role (PostgREST public reads)
-- (policy already covers the table; this is a belt-and-suspenders grant)
GRANT SELECT (is_director) ON team_members TO anon;
