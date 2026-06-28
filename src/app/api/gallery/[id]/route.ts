import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, description, category_id } = await req.json();
  const { rows } = await pool.query(
    `UPDATE gallery SET title=$1, description=$2, category_id=$3 WHERE id=$4 RETURNING *`,
    [title || null, description || null, category_id || null, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM gallery WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
