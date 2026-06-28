import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { question, answer, is_published } = await req.json();
  const { rows } = await pool.query(
    `UPDATE faqs SET question=$1, answer=$2, is_published=$3 WHERE id=$4 RETURNING *`,
    [question, answer, is_published ?? false, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM faqs WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
