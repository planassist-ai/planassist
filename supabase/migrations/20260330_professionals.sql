-- ─── Professionals directory table ───────────────────────────────────────────
-- Run this in the Supabase SQL Editor (or via supabase db push).

CREATE TABLE IF NOT EXISTS professionals (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  practice_name   text        NOT NULL,
  profession_type text        NOT NULL
    CHECK (profession_type IN (
      'architect',
      'architectural_technologist',
      'planning_consultant',
      'civil_engineer',
      'land_agent',
      'solicitor'
    )),
  email           text        NOT NULL,
  phone           text,
  website         text,
  bio             text,
  counties        text[]      NOT NULL DEFAULT '{}',
  specialisms     text[]      NOT NULL DEFAULT '{}',
  is_verified     boolean     NOT NULL DEFAULT false,
  is_featured     boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common filter queries
CREATE INDEX IF NOT EXISTS professionals_profession_type_idx ON professionals (profession_type);
CREATE INDEX IF NOT EXISTS professionals_counties_idx        ON professionals USING GIN (counties);
CREATE INDEX IF NOT EXISTS professionals_specialisms_idx     ON professionals USING GIN (specialisms);
CREATE INDEX IF NOT EXISTS professionals_featured_idx        ON professionals (is_featured, created_at DESC);

-- Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read all listings
CREATE POLICY "Public read professionals"
  ON professionals FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone (including anon) can insert a new listing (public free directory)
-- Rate limiting is enforced in the API route
CREATE POLICY "Public insert professionals"
  ON professionals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admin via Supabase dashboard) can update/delete
CREATE POLICY "Authenticated update professionals"
  ON professionals FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete professionals"
  ON professionals FOR DELETE
  TO authenticated
  USING (true);
