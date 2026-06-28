import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, description, cover_url, client, url, status } = await req.json();
  const { rows } = await pool.query(
    `UPDATE projects SET title=$1, description=$2, cover_url=$3, client=$4, url=$5, status=$6
     WHERE id=$7 RETURNING *`,
    [title, description || null, cover_url || null, client || null, url || null, status, id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM projects WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
