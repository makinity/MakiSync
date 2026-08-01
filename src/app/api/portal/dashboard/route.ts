import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  // Resolve client_id — clients are scoped to their own record
  let clientId: string | null = null;
  if (user.role === 'client') {
    const { rows } = await pool.query(
      'SELECT id FROM clients WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    clientId = rows[0]?.id ?? null;
    if (!clientId) {
      return NextResponse.json({
        success: true,
        data: { waiting_approval: 0, scheduled: 0, published_this_month: 0, unread_messages: 0 },
      });
    }
  } else {
    // Admin: optionally scope by client_id query param
    clientId = new URL(req.url).searchParams.get('client_id');
  }

  const filter   = clientId ? 'AND ci.client_id = $1' : '';
  const params   = clientId ? [clientId] : [];

  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE ci.status = 'proposed')                                          AS waiting_approval,
       COUNT(*) FILTER (WHERE ci.status = 'scheduled')                                         AS scheduled,
       COUNT(*) FILTER (
         WHERE ci.status = 'published'
           AND ci.published_at >= date_trunc('month', NOW())
       )                                                                                        AS published_this_month
     FROM content_items ci
     WHERE ci.deleted_at IS NULL ${filter}`,
    params
  );

  // Unread messages for this user
  const msgParams: (string | number | null)[] = clientId ? [user.id, clientId] : [user.id, null];
  const unreadQuery = clientId
    ? `SELECT COUNT(*)::int AS count FROM portal_messages WHERE is_read = false AND sender_id != $1 AND client_id = $2`
    : `SELECT 0::int AS count`;

  const { rows: msgRows } = await pool.query(unreadQuery, clientId ? msgParams : []);

  const r = rows[0];
  return NextResponse.json({
    success: true,
    data: {
      waiting_approval:      parseInt(r.waiting_approval,      10),
      scheduled:             parseInt(r.scheduled,             10),
      published_this_month:  parseInt(r.published_this_month,  10),
      unread_messages:       msgRows[0]?.count ?? 0,
    },
  });
}
