-- Add is_architect column to profiles to track architect subscription tier.
-- Run this in the Supabase SQL Editor (or via supabase db push).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_architect boolean NOT NULL DEFAULT false;

-- Index for quick lookups in webhook + auth hook.
CREATE INDEX IF NOT EXISTS profiles_is_architect_idx ON profiles (is_architect);
