-- Migration 010: Testimonials Portal
-- Extends the testimonials table to support client-submitted reviews from the Client Portal.
-- Adds client_id (FK to clients), source, created_at, updated_at columns.
-- Adds a unique index to enforce one testimonial per client.
-- Author: Kiro
-- Date: 2026-08-02

BEGIN;

-- Add client_id: links a testimonial to a portal client (nullable — existing admin records remain NULL)
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source      TEXT NOT NULL DEFAULT 'admin'
    CHECK (source IN ('admin', 'client')),
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Enforce one testimonial per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_client_id
  ON testimonials(client_id)
  WHERE client_id IS NOT NULL;

COMMIT;
