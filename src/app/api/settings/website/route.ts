import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query('SELECT site_name, logo_url, favicon_url, maintenance_mode FROM website_settings WHERE id=1');
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { site_name, logo_url, favicon_url, maintenance_mode } = await req.json();
  const { rows } = await pool.query(
    `UPDATE website_settings SET site_name=$1, logo_url=$2, favicon_url=$3, maintenance_mode=$4 WHERE id=1 RETURNING *`,
    [site_name||null, logo_url||null, favicon_url||null, maintenance_mode ?? false]
  );
  return NextResponse.json(rows[0]);
}
