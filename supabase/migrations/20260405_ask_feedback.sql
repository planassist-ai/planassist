-- ─── Ask a Planning Question — feedback table ─────────────────────────────────
-- Run this in the Supabase SQL Editor (or via supabase db push).

CREATE TABLE IF NOT EXISTS ask_feedback (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  question    text        NOT NULL,
  answer      text        NOT NULL,
  helpful     boolean     NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Allow anonymous inserts (feedback is public)
ALTER TABLE ask_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON ask_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can read feedback
CREATE POLICY "Authenticated users can read feedback"
  ON ask_feedback FOR SELECT
  TO authenticated
  USING (true);
