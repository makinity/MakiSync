import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);

  let query = `
    SELECT m.*, g.name as group_name
    FROM jobhunter_matches m
    LEFT JOIN jobhunter_groups g ON g.id = m.group_id
  `;
  const params: (string | number)[] = [];

  if (status) {
    query += ' WHERE m.status = $1';
    params.push(status);
  }

  query += ' ORDER BY m.created_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const { rows } = await pool.query(query, params);
  return NextResponse.json(rows);
}
