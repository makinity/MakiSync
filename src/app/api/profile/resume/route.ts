import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT title, description, file_url, updated_at FROM resume WHERE id=1');
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { title, description, file_url } = await req.json();
  const { rows } = await pool.query(
    `UPDATE resume SET title=$1, description=$2, file_url=$3, updated_at=NOW()
     WHERE id=1 RETURNING title, description, file_url, updated_at`,
    [title || null, description || null, file_url || null]
  );
  return NextResponse.json(rows[0]);
}
