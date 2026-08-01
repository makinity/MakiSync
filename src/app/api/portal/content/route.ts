import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('client_id');

  let query = `
    SELECT ci.*,
      c.business_name as client_name,
      COALESCE(
        json_agg(cm ORDER BY cm.sort_order)
        FILTER (WHERE cm.id IS NOT NULL), '[]'
      ) AS media
    FROM content_items ci
    JOIN clients c ON c.id = ci.client_id
    LEFT JOIN content_media cm ON cm.content_item_id = ci.id
    WHERE ci.deleted_at IS NULL
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (user.role === 'client') {
    // Scope to the client's own content, no drafts
    const { rows } = await pool.query(
      'SELECT id FROM clients WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    const cid = rows[0]?.id;
    if (!cid) {
      return NextResponse.json({ success: true, data: [] });
    }
    query += ` AND ci.client_id = $${idx++} AND ci.status != 'draft'`;
    params.push(cid);
  } else if (clientId) {
    query += ` AND ci.client_id = $${idx++}`;
    params.push(clientId);
  }

  if (status) {
    query += ` AND ci.status = $${idx++}`;
    params.push(status);
  }

  query += ' GROUP BY ci.id, c.business_name ORDER BY ci.created_at DESC';

  const { rows } = await pool.query(query, params);
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { client_id, title, caption, platform, notes, scheduled_at } = body;

  if (!client_id || !title || !platform) {
    return NextResponse.json({ success: false, message: 'Missing required fields: client_id, title, platform' }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO content_items (client_id, created_by, title, caption, platform, notes, scheduled_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
     RETURNING *`,
    [client_id, user.id, title, caption ?? null, platform, notes ?? null, scheduled_at ?? null]
  );

  return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
}
