import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await pool.query(
    'UPDATE notifications SET is_read = true WHERE recipient_id = $1 AND is_read = false',
    [user.id]
  );

  return NextResponse.json({ ok: true });
}
