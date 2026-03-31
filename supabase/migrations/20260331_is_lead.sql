-- Add is_lead and onboarding_complete columns to profiles.
-- is_lead: true when a user signed up via the /for-architects page — needs following up.
-- onboarding_complete: false until the architect has been onboarded.
-- Run this in the Supabase SQL Editor (or via supabase db push).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_lead boolean NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_lead_idx ON profiles (is_lead);
