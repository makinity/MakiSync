import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT page_key, meta_title, meta_description, og_image_url FROM seo ORDER BY page_key');
  return NextResponse.json(rows);
}

export async function PUT(req: NextRequest) {
  const { page_key, meta_title, meta_description, og_image_url } = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO seo (page_key, meta_title, meta_description, og_image_url)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (page_key) DO UPDATE SET meta_title=$2, meta_description=$3, og_image_url=$4
     RETURNING *`,
    [page_key, meta_title||null, meta_description||null, og_image_url||null]
  );
  return NextResponse.json(rows[0]);
}
