import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { ContentService } from '@/services/content.service';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!body.scheduled_at) return NextResponse.json({ error: 'scheduled_at required' }, { status: 400 });

  const updated = await ContentService.schedule(id, body.scheduled_at);
  if (!updated) return NextResponse.json({ error: 'Content not found or not approved' }, { status: 404 });

  // Notify client
  await pool.query(
    `INSERT INTO notifications (recipient_id, type, title, body, reference_id, reference_type)
     SELECT c.user_id, 'content_scheduled', 'Content Scheduled', $2, $1, 'content_item'
     FROM content_items ci JOIN clients c ON c.id = ci.client_id WHERE ci.id = $1`,
    [id, `Content "${updated.title}" has been scheduled for ${new Date(body.scheduled_at).toLocaleDateString()}`]
  );

  return NextResponse.json({ ok: true, data: updated });
}
