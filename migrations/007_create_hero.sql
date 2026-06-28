CREATE TABLE IF NOT EXISTS hero (
  id           SERIAL PRIMARY KEY,
  headline     TEXT,
  subheadline  TEXT,
  cta_text     TEXT,
  cta_url      TEXT,
  bg_image_url TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO hero (id) VALUES (1) ON CONFLICT DO NOTHING;
