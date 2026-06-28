import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, title, issuer, issue_date, expiry_date, credential_url, image_url, "order" FROM certifications ORDER BY "order" ASC, issue_date DESC NULLS LAST'
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { title, issuer, issue_date, expiry_date, credential_url, image_url } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO certifications (title, issuer, issue_date, expiry_date, credential_url, image_url, "order")
     VALUES ($1,$2,$3,$4,$5,$6,(SELECT COALESCE(MAX("order"),0)+1 FROM certifications)) RETURNING *`,
    [title, issuer||null, issue_date||null, expiry_date||null, credential_url||null, image_url||null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
