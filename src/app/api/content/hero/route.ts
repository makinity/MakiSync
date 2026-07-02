import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM hero WHERE id=1');
    return NextResponse.json(rows[0] ?? {});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { headline, subheadline, cta_text, cta_url, bg_image_url } = await req.json();
  const { rows } = await pool.query(
    `UPDATE hero SET headline=$1, subheadline=$2, cta_text=$3, cta_url=$4, bg_image_url=$5, updated_at=NOW() WHERE id=1 RETURNING *`,
    [headline||null, subheadline||null, cta_text||null, cta_url||null, bg_image_url||null]
  );
  return NextResponse.json(rows[0]);
}
