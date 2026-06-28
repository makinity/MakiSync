import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT id, name, slug FROM gallery_categories ORDER BY "order" ASC, name ASC');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { rows } = await pool.query(
    `INSERT INTO gallery_categories (name, slug, "order")
     VALUES ($1, $2, (SELECT COALESCE(MAX("order"),0)+1 FROM gallery_categories))
     ON CONFLICT (slug) DO UPDATE SET name=$1 RETURNING *`,
    [name, slug]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
