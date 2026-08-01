import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { MessageService } from '@/services/message.service';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  let clientId: string | null = null;

  if (user.role === 'client') {
    const { rows } = await pool.query(
      'SELECT id FROM clients WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    clientId = rows[0]?.id ?? null;
  } else {
    clientId = new URL(req.url).searchParams.get('client_id');
  }

  if (!clientId) return NextResponse.json({ success: true, data: [] });

  const messages = await MessageService.getThread(clientId);
  await MessageService.markRead(clientId, user.id);

  return NextResponse.json({ success: true, data: messages });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { client_id, body: msgBody } = body;

  if (!client_id || !msgBody?.trim()) {
    return NextResponse.json({ success: false, message: 'Missing client_id or body' }, { status: 400 });
  }

  const msg = await MessageService.send(client_id, user.id, msgBody.trim());
  return NextResponse.json({ success: true, data: msg }, { status: 201 });
}
