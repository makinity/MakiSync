import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();

  const { rows } = await pool.query(
    'UPDATE jobhunter_skills SET name=$1 WHERE id=$2 RETURNING *',
    [name, id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM jobhunter_skills WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
