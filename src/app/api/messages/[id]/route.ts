import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { is_read } = await req.json();
  const { rows } = await pool.query('UPDATE messages SET is_read=$1 WHERE id=$2 RETURNING *', [is_read, id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM messages WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
