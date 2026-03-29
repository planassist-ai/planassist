-- ─── Builders directory table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builders (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name         text        NOT NULL,
  contact_name         text        NOT NULL,
  trade_types          text[]      NOT NULL DEFAULT '{}',
  project_size_min     integer,            -- EUR value, e.g. 50000
  project_size_max     integer,            -- EUR value, e.g. 300000
  counties             text[]      NOT NULL DEFAULT '{}',
  email                text        NOT NULL,
  phone                text,
  website              text,
  bio                  text,
  insurance_confirmed  boolean     NOT NULL DEFAULT false,
  tax_compliant        boolean     NOT NULL DEFAULT false,
  is_verified          boolean     NOT NULL DEFAULT false,
  is_featured          boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS builders_trade_types_idx ON builders USING GIN (trade_types);
CREATE INDEX IF NOT EXISTS builders_counties_idx    ON builders USING GIN (counties);
CREATE INDEX IF NOT EXISTS builders_featured_idx    ON builders (is_featured, created_at DESC);

ALTER TABLE builders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read builders"
  ON builders FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert builders"
  ON builders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update builders"
  ON builders FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete builders"
  ON builders FOR DELETE TO authenticated
  USING (true);

-- ─── Reviews table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_user_id  uuid,                                -- nullable — set when logged in
  professional_id   uuid        REFERENCES professionals(id) ON DELETE CASCADE,
  builder_id        uuid        REFERENCES builders(id)     ON DELETE CASCADE,
  rating            integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text       text,
  project_type      text,
  county            text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_target_check CHECK (
    (professional_id IS NOT NULL AND builder_id IS NULL) OR
    (professional_id IS NULL     AND builder_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS reviews_professional_id_idx ON reviews (professional_id);
CREATE INDEX IF NOT EXISTS reviews_builder_id_idx      ON reviews (builder_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (true);
