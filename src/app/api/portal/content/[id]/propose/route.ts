import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const { rows: contentRows } = await pool.query('SELECT * FROM content_items WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!contentRows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (contentRows[0].status !== 'draft') return NextResponse.json({ error: 'Content must be in draft status' }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE content_items SET status = 'proposed', updated_at = NOW() WHERE id = $1`, [id]);
    // Notify client
    await client.query(
      `INSERT INTO notifications (recipient_id, type, title, body, reference_id, reference_type)
       SELECT c.user_id, 'content_proposed', 'New Content Proposed', $2, $1, 'content_item'
       FROM content_items ci JOIN clients c ON c.id = ci.client_id WHERE ci.id = $1`,
      [id, `Content "${contentRows[0].title}" is ready for your review`]
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
