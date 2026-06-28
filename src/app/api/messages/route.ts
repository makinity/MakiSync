import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, sender_name, sender_email, subject, body, is_read, created_at FROM messages ORDER BY created_at DESC'
  );
  return NextResponse.json(rows);
}
