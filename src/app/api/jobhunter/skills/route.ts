import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM jobhunter_skills ORDER BY "order" ASC'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO jobhunter_skills (name, "order")
     VALUES ($1, (SELECT COALESCE(MAX("order"),0)+1 FROM jobhunter_skills))
     RETURNING *`,
    [name]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
