import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function GET() {
  const { rows } = await pool.query('SELECT id, username, email FROM users WHERE id=1');
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { username, email, current_password, new_password } = await req.json();

  // If changing password, verify current first
  if (new_password) {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=1');
    const valid = await verifyPassword(current_password ?? '', rows[0]?.password_hash ?? '');
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    const hash = await hashPassword(new_password);
    await pool.query('UPDATE users SET username=$1, email=$2, password_hash=$3 WHERE id=1', [username, email, hash]);
  } else {
    await pool.query('UPDATE users SET username=$1, email=$2 WHERE id=1', [username, email]);
  }

  return NextResponse.json({ ok: true });
}
