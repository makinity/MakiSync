-- JobHunter AI — Feature tables
-- Added as part of the personal automation system within MakiSync ecosystem.

-- Config (singleton row — global settings)
CREATE TABLE IF NOT EXISTS jobhunter_config (
  id                SERIAL PRIMARY KEY,
  enabled           BOOLEAN NOT NULL DEFAULT false,
  scan_interval     TEXT NOT NULL DEFAULT '30m',
  auto_notify       BOOLEAN NOT NULL DEFAULT true,
  min_match_score   INT NOT NULL DEFAULT 70,
  exclude_keywords  TEXT[] DEFAULT '{}',
  notify_channel    TEXT NOT NULL DEFAULT 'telegram' CHECK (notify_channel IN ('telegram','email','both')),
  notify_frequency  TEXT NOT NULL DEFAULT 'instant' CHECK (notify_frequency IN ('instant','digest')),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config row
INSERT INTO jobhunter_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Monitored Facebook groups
CREATE TABLE IF NOT EXISTS jobhunter_groups (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  last_scan   TIMESTAMPTZ,
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills used for AI matching
CREATE TABLE IF NOT EXISTS jobhunter_skills (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0
);

-- Insert default SMM/VA skills
INSERT INTO jobhunter_skills (name, "order") VALUES
  ('Social Media Management', 0),
  ('Content Planning', 1),
  ('Content Scheduling', 2),
  ('Canva Design', 3),
  ('Meta Ads', 4),
  ('TikTok Ads', 5),
  ('Virtual Assistance', 6),
  ('Email Marketing', 7),
  ('Lead Generation', 8),
  ('Research', 9),
  ('Documentation', 10)
ON CONFLICT DO NOTHING;

-- Matched job posts
CREATE TABLE IF NOT EXISTS jobhunter_matches (
  id            SERIAL PRIMARY KEY,
  group_id      INT REFERENCES jobhunter_groups(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  content       TEXT,
  author        TEXT,
  post_url      TEXT,
  match_score   INT,
  notified      BOOLEAN NOT NULL DEFAULT false,
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','viewed','applied','ignored')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
