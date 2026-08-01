import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME, hashPassword } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { rows } = await pool.query(`
    SELECT c.*, u.username, u.email
    FROM clients c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at DESC
  `);

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { username, email, password, business_name, industry, notes } = body;

  if (!username || !email || !password || !business_name) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await hashPassword(password);
    const { rows: userRows } = await client.query(
      `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'client') RETURNING id`,
      [username, email, passwordHash]
    );

    const { rows: clientRows } = await client.query(
      `INSERT INTO clients (user_id, business_name, industry, notes) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userRows[0].id, business_name, industry ?? null, notes ?? null]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: { ...clientRows[0], username, email } }, { status: 201 });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const isDupe = err instanceof Error && err.message.includes('unique');
    return NextResponse.json(
      { success: false, message: isDupe ? 'Username or email already exists.' : 'Failed to create client.' },
      { status: isDupe ? 409 : 500 }
    );
  } finally {
    client.release();
  }
}
