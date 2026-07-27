import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM jobhunter_groups ORDER BY "order" ASC, created_at DESC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name, url } = await req.json();
  if (!name || !url) {
    return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO jobhunter_groups (name, url, "order")
     VALUES ($1, $2, (SELECT COALESCE(MAX("order"),0)+1 FROM jobhunter_groups))
     RETURNING *`,
    [name, url]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
