import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  const allowed = ['new', 'viewed', 'applied', 'ignored'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { rows } = await pool.query(
    'UPDATE jobhunter_matches SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
