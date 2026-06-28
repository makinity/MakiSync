-- Profile (single row)
CREATE TABLE IF NOT EXISTS profile (
  id                SERIAL PRIMARY KEY,
  full_name         TEXT,
  tagline           TEXT,
  bio               TEXT,
  avatar_url        TEXT,
  location          TEXT,
  years_experience  INT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO profile (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Resume (single row)
CREATE TABLE IF NOT EXISTS resume (
  id          SERIAL PRIMARY KEY,
  title       TEXT,
  description TEXT,
  file_url    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO resume (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Contact links (key-value)
CREATE TABLE IF NOT EXISTS contacts (
  id     SERIAL PRIMARY KEY,
  key    TEXT NOT NULL UNIQUE,
  label  TEXT NOT NULL,
  value  TEXT
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  client      TEXT,
  url         TEXT,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery categories
CREATE TABLE IF NOT EXISTS gallery_categories (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  slug    TEXT NOT NULL UNIQUE,
  "order" INT NOT NULL DEFAULT 0
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES gallery_categories(id) ON DELETE SET NULL,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  logo_url  TEXT,
  category  TEXT,
  "order"   INT NOT NULL DEFAULT 0
);

-- Tools
CREATE TABLE IF NOT EXISTS tools (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  logo_url  TEXT,
  category  TEXT,
  "order"   INT NOT NULL DEFAULT 0
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  "order"     INT NOT NULL DEFAULT 0
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id                SERIAL PRIMARY KEY,
  client_name       TEXT NOT NULL,
  client_title      TEXT,
  client_avatar_url TEXT,
  message           TEXT NOT NULL,
  rating            INT CHECK (rating BETWEEN 1 AND 5),
  is_published      BOOLEAN NOT NULL DEFAULT false,
  "order"           INT NOT NULL DEFAULT 0
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  issuer         TEXT,
  issue_date     DATE,
  expiry_date    DATE,
  credential_url TEXT,
  image_url      TEXT,
  "order"        INT NOT NULL DEFAULT 0
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id           SERIAL PRIMARY KEY,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  "order"      INT NOT NULL DEFAULT 0
);

-- SEO (one row per page)
CREATE TABLE IF NOT EXISTS seo (
  id               SERIAL PRIMARY KEY,
  page_key         TEXT NOT NULL UNIQUE,
  meta_title       TEXT,
  meta_description TEXT,
  og_image_url     TEXT
);

-- Messages (incoming contact form)
CREATE TABLE IF NOT EXISTS messages (
  id           SERIAL PRIMARY KEY,
  sender_name  TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject      TEXT,
  body         TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Website settings (single row)
CREATE TABLE IF NOT EXISTS website_settings (
  id               SERIAL PRIMARY KEY,
  site_name        TEXT,
  logo_url         TEXT,
  favicon_url      TEXT,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO website_settings (id, site_name) VALUES (1, 'MakiSync') ON CONFLICT DO NOTHING;
