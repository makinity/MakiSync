import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT id, type, title, body, reference_id, reference_type, is_read, created_at
     FROM notifications
     WHERE recipient_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [user.id]
  );

  const unreadCount = rows.filter(n => !n.is_read).length;

  return NextResponse.json({ success: true, data: rows, unread_count: unreadCount });
}
