-- ============================================================
-- Dashboard fixes migration — 2026-04-14
-- ============================================================
-- 1. Add user_id to applications so each architect owns their apps
-- 2. Add profile fields for architect settings page
-- 3. Set up RLS on applications (service role used in API, but good practice)
-- ============================================================

-- 1. Add user_id column to applications
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications (user_id);

-- 2. Add profile fields for settings
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name       text,
  ADD COLUMN IF NOT EXISTS practice_name   text,
  ADD COLUMN IF NOT EXISTS county          text,
  ADD COLUMN IF NOT EXISTS num_architects  integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS specialisms     text[],
  ADD COLUMN IF NOT EXISTS counties_covered text[],
  ADD COLUMN IF NOT EXISTS email_alerts    boolean NOT NULL DEFAULT true;

-- 3. Enable RLS on applications (API uses service role key — this is defence-in-depth)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "architects manage own applications" ON applications;
CREATE POLICY "architects manage own applications" ON applications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS, so API routes using service role key are unaffected.
-- Direct Supabase client connections (e.g. PostgREST via anon key) will be restricted.

-- 4. Enable RLS on practices if not already
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read practices" ON practices;
CREATE POLICY "public read practices" ON practices
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "architects manage own practice" ON practices;
CREATE POLICY "architects manage own practice" ON practices
  FOR ALL
  USING (architect_email = auth.jwt() ->> 'email')
  WITH CHECK (architect_email = auth.jwt() ->> 'email');
