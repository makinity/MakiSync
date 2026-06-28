import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, issuer, issue_date, expiry_date, credential_url, image_url } = await req.json();
  const { rows } = await pool.query(
    `UPDATE certifications SET title=$1, issuer=$2, issue_date=$3, expiry_date=$4, credential_url=$5, image_url=$6 WHERE id=$7 RETURNING *`,
    [title, issuer||null, issue_date||null, expiry_date||null, credential_url||null, image_url||null, id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pool.query('DELETE FROM certifications WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
