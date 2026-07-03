import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  // Add thumbnail_url column if it doesn't exist yet
  await pool.query(`ALTER TABLE resume ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`).catch(() => {});
  const { rows } = await pool.query('SELECT title, description, file_url, thumbnail_url, updated_at FROM resume WHERE id=1');
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { title, description, file_url, thumbnail_url } = await req.json();
  // Only update file_url/thumbnail_url if a non-empty value is provided, otherwise keep existing
  const { rows } = await pool.query(
    `UPDATE resume SET
      title=$1,
      description=$2,
      file_url=CASE WHEN $3::text IS NOT NULL AND $3::text <> '' THEN $3::text ELSE file_url END,
      thumbnail_url=CASE WHEN $4::text IS NOT NULL AND $4::text <> '' THEN $4::text ELSE thumbnail_url END,
      updated_at=NOW()
     WHERE id=1 RETURNING title, description, file_url, thumbnail_url, updated_at`,
    [title || null, description || null, file_url ?? null, thumbnail_url ?? null]
  );
  return NextResponse.json(rows[0]);
}
