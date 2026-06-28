import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, logo_url, category } = await req.json();
  const { rows } = await pool.query(
    `UPDATE tools SET name=$1, logo_url=$2, category=$3 WHERE id=$4 RETURNING *`,
    [name, logo_url || null, category || null, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM tools WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
