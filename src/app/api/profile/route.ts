import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT full_name, tagline, bio, avatar_url, location, years_experience FROM profile WHERE id=1'
  );
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const { full_name, tagline, bio, location, years_experience } = await req.json();
  const { rows } = await pool.query(
    `UPDATE profile SET full_name=$1, tagline=$2, bio=$3, location=$4, years_experience=$5, updated_at=NOW()
     WHERE id=1 RETURNING full_name, tagline, bio, avatar_url, location, years_experience`,
    [full_name || null, tagline || null, bio || null, location || null, years_experience || null]
  );
  return NextResponse.json(rows[0]);
}
