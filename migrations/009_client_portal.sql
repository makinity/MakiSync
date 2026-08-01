-- Migration 009: Client Portal
-- Adds role column to users, creates all portal tables, enums, and indexes.
-- Author: Hermes Agent
-- Date: 2026-07-29

BEGIN;

-- ============================================================
-- 1. ALTER EXISTING TABLE
-- ============================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'
CHECK (role IN ('admin', 'client'));

-- ============================================================
-- 2. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM (
    'draft', 'proposed', 'approved', 'scheduled', 'published', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM (
    'facebook', 'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('image', 'video', 'document', 'brand_kit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE analytics_source AS ENUM ('manual', 'api');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'content_proposed', 'content_approved', 'content_rejected',
    'content_changes_requested', 'content_published', 'content_scheduled',
    'message_received', 'asset_uploaded'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. NEW TABLES
-- ============================================================

-- Client business profiles (1:1 with users where role = 'client')
CREATE TABLE IF NOT EXISTS clients (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name          TEXT NOT NULL,
  industry               TEXT,
  logo_url               TEXT,
  brand_color_primary    TEXT,
  brand_color_secondary  TEXT,
  notes                  TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Core content table — every SMM post lives here
CREATE TABLE IF NOT EXISTS content_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_by       INT NOT NULL REFERENCES users(id),
  title            TEXT NOT NULL,
  caption          TEXT,
  status           content_status NOT NULL DEFAULT 'draft',
  platform         platform_type NOT NULL,
  scheduled_at     TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  rejected_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  notes            TEXT,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media files attached to content items (carousel support)
CREATE TABLE IF NOT EXISTS content_media (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  file_url         TEXT NOT NULL,
  file_type        media_type NOT NULL,
  file_name        TEXT NOT NULL,
  file_size        BIGINT,
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments and change requests on content
CREATE TABLE IF NOT EXISTS content_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id   UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  author_id         INT NOT NULL REFERENCES users(id),
  body              TEXT NOT NULL,
  is_change_request BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics snapshots per content item
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  platform         platform_type NOT NULL,
  impressions      INT,
  reach            INT,
  likes            INT,
  comments         INT,
  shares           INT,
  saves            INT,
  clicks           INT,
  captured_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source           analytics_source NOT NULL DEFAULT 'manual',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client-owned files: images, videos, brand kit, documents
CREATE TABLE IF NOT EXISTS assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by  INT NOT NULL REFERENCES users(id),
  file_name    TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    asset_type NOT NULL,
  file_size    BIGINT,
  mime_type    TEXT,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internal conversation between admin and a specific client
CREATE TABLE IF NOT EXISTS portal_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_id   INT NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- In-app notifications for portal users
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  reference_id    UUID,
  reference_type  TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- Content: most common query — client's content by status
CREATE INDEX IF NOT EXISTS idx_content_items_client_status
  ON content_items(client_id, status)
  WHERE deleted_at IS NULL;

-- Content: scheduled content ordered by date
CREATE INDEX IF NOT EXISTS idx_content_items_scheduled
  ON content_items(scheduled_at)
  WHERE status = 'scheduled';

-- Content media: lookup by content item
CREATE INDEX IF NOT EXISTS idx_content_media_item
  ON content_media(content_item_id);

-- Comments: lookup by content item
CREATE INDEX IF NOT EXISTS idx_content_comments_item
  ON content_comments(content_item_id);

-- Analytics: lookup by content item
CREATE INDEX IF NOT EXISTS idx_analytics_content_id
  ON analytics_snapshots(content_item_id);

-- Assets: client's assets by type
CREATE INDEX IF NOT EXISTS idx_assets_client_type
  ON assets(client_id, file_type)
  WHERE deleted_at IS NULL;

-- Messages: conversation thread per client
CREATE INDEX IF NOT EXISTS idx_portal_messages_client
  ON portal_messages(client_id, created_at DESC);

-- Notifications: unread for recipient
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON notifications(recipient_id, is_read, created_at DESC);

COMMIT;
