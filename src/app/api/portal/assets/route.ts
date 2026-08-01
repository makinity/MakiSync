import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { AssetService } from '@/services/asset.service';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fileType = searchParams.get('type') ?? undefined;

  let clientId: string;
  if (user.role === 'client') {
    const { rows } = await pool.query('SELECT id FROM clients WHERE user_id = $1', [user.id]);
    clientId = rows[0]?.id;
  } else {
    clientId = searchParams.get('client_id') ?? '';
  }

  if (!clientId) return NextResponse.json([]);

  const assets = await AssetService.list(clientId, fileType);
  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { client_id, file_name, file_url, file_type, file_size, mime_type } = body;

  if (!client_id || !file_name || !file_url || !file_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const asset = await AssetService.create({
    client_id, uploaded_by: user.id, file_name, file_url, file_type, file_size, mime_type,
  });
  return NextResponse.json(asset, { status: 201 });
}
