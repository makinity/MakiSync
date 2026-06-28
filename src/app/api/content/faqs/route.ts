import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT id, question, answer, is_published, "order" FROM faqs ORDER BY "order" ASC, id ASC');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { question, answer, is_published } = await req.json();
  if (!question || !answer) return NextResponse.json({ error: 'Question and answer required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO faqs (question, answer, is_published, "order") VALUES ($1,$2,$3,(SELECT COALESCE(MAX("order"),0)+1 FROM faqs)) RETURNING *`,
    [question, answer, is_published ?? false]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
