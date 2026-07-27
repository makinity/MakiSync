import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM jobhunter_config WHERE id=1');
  if (!rows[0]) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    enabled, scan_interval, auto_notify, min_match_score,
    exclude_keywords, notify_channel, notify_frequency,
  } = body;

  const { rows } = await pool.query(
    `UPDATE jobhunter_config SET
      enabled=$1, scan_interval=$2, auto_notify=$3, min_match_score=$4,
      exclude_keywords=$5, notify_channel=$6, notify_frequency=$7, updated_at=NOW()
     WHERE id=1 RETURNING *`,
    [
      enabled ?? false,
      scan_interval ?? '30m',
      auto_notify ?? true,
      min_match_score ?? 70,
      exclude_keywords ?? [],
      notify_channel ?? 'telegram',
      notify_frequency ?? 'instant',
    ]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
