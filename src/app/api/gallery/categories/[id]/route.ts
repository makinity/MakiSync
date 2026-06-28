import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { rows } = await pool.query(
    `UPDATE gallery_categories SET name=$1, slug=$2 WHERE id=$3 RETURNING *`,
    [name, slug, id]
  );
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Nullify category_id on gallery items before deleting
  await pool.query(`UPDATE gallery SET category_id=NULL WHERE category_id=$1`, [id]);
  await pool.query(`DELETE FROM gallery_categories WHERE id=$1`, [id]);
  return NextResponse.json({ ok: true });
}
