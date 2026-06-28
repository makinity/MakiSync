import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const DEFAULT_CONTACTS = [
  { key: 'email',     label: 'Email' },
  { key: 'phone',     label: 'Phone' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook',  label: 'Facebook' },
  { key: 'linkedin',  label: 'LinkedIn' },
  { key: 'twitter',   label: 'Twitter / X' },
  { key: 'website',   label: 'Website' },
];

export async function GET() {
  const { rows } = await pool.query('SELECT key, label, value FROM contacts ORDER BY id');
  // Merge defaults with saved values
  const saved = Object.fromEntries(rows.map((r: any) => [r.key, r]));
  const result = DEFAULT_CONTACTS.map(d => ({
    key: d.key,
    label: saved[d.key]?.label ?? d.label,
    value: saved[d.key]?.value ?? '',
  }));
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const contacts: { key: string; label: string; value: string }[] = await req.json();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const c of contacts) {
      await client.query(
        `INSERT INTO contacts (key, label, value) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET label=$2, value=$3`,
        [c.key, c.label, c.value || null]
      );
    }
    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
