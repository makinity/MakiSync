import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, name, logo_url, category, "order" FROM skills ORDER BY "order" ASC, name ASC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name, logo_url, category } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO skills (name, logo_url, category, "order")
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX("order"),0)+1 FROM skills))
     RETURNING *`,
    [name, logo_url || null, category || null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
