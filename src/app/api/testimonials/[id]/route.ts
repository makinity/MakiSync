import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { client_name, client_title, client_avatar_url, message, rating, is_published } = await req.json();
  const { rows } = await pool.query(
    `UPDATE testimonials SET client_name=$1, client_title=$2, client_avatar_url=$3, message=$4, rating=$5, is_published=$6 WHERE id=$7 RETURNING *`,
    [client_name, client_title || null, client_avatar_url || null, message, rating || 5, is_published ?? false, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM testimonials WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
