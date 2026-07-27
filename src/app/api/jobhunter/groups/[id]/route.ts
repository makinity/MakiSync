import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, url, status } = await req.json();

  const { rows } = await pool.query(
    `UPDATE jobhunter_groups SET name=$1, url=$2, status=$3 WHERE id=$4 RETURNING *`,
    [name, url, status, id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM jobhunter_groups WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
