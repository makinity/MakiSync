import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  await pool.query('SELECT 1');
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
