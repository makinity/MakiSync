import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, title, description, icon, "order" FROM services ORDER BY "order" ASC, id ASC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { title, description, icon } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO services (title, description, icon, "order")
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX("order"),0)+1 FROM services))
     RETURNING *`,
    [title, description || null, icon || null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
