import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!body.comment) return NextResponse.json({ error: 'Comment required' }, { status: 400 });

  const { rows: contentRows } = await pool.query(
    `SELECT ci.*, c.user_id FROM content_items ci JOIN clients c ON c.id = ci.client_id WHERE ci.id = $1`,
    [id]
  );
  if (!contentRows.length || contentRows[0].user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (contentRows[0].status !== 'proposed') {
    return NextResponse.json({ error: 'Content is not in proposed status' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO content_comments (content_item_id, author_id, body, is_change_request) VALUES ($1, $2, $3, true)`,
      [id, user.id, body.comment]
    );
    await client.query(
      `INSERT INTO notifications (recipient_id, type, title, body, reference_id, reference_type)
       SELECT ci.created_by, 'content_changes_requested', 'Changes Requested', $2, $1, 'content_item'
       FROM content_items ci WHERE ci.id = $1`,
      [id, `Changes requested on "${contentRows[0].title}": ${body.comment}`]
    );
    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
