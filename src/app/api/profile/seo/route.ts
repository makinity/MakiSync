import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const PAGE_KEY = 'profile';

export async function GET() {
  const { rows } = await pool.query('SELECT meta_title, meta_description, og_image_url FROM seo WHERE page_key=$1', [PAGE_KEY]);
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { meta_title, meta_description, og_image_url } = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO seo (page_key, meta_title, meta_description, og_image_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (page_key) DO UPDATE SET meta_title=$2, meta_description=$3, og_image_url=$4
     RETURNING meta_title, meta_description, og_image_url`,
    [PAGE_KEY, meta_title || null, meta_description || null, og_image_url || null]
  );
  return NextResponse.json(rows[0]);
}
