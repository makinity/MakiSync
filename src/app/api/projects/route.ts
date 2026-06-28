import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, title, description, cover_url, client, url, status, "order", created_at FROM projects ORDER BY "order" ASC, created_at DESC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { title, description, cover_url, client, url, status } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO projects (title, description, cover_url, client, url, status, "order")
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX("order"),0)+1 FROM projects))
     RETURNING *`,
    [title, description || null, cover_url || null, client || null, url || null, status || 'draft']
  );
  return NextResponse.json(rows[0], { status: 201 });
}
