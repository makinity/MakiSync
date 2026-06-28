import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, client_name, client_title, client_avatar_url, message, rating, is_published, "order" FROM testimonials ORDER BY "order" ASC, id DESC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { client_name, client_title, client_avatar_url, message, rating, is_published } = await req.json();
  if (!client_name || !message) return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO testimonials (client_name, client_title, client_avatar_url, message, rating, is_published, "order")
     VALUES ($1,$2,$3,$4,$5,$6,(SELECT COALESCE(MAX("order"),0)+1 FROM testimonials)) RETURNING *`,
    [client_name, client_title || null, client_avatar_url || null, message, rating || 5, is_published ?? false]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
