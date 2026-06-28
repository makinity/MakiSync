import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(`
    SELECT g.id, g.image_url, g.title, g.description, g.order, g.created_at,
           gc.id as category_id, gc.name as category_name
    FROM gallery g
    LEFT JOIN gallery_categories gc ON g.category_id = gc.id
    ORDER BY g."order" ASC, g.created_at DESC
  `);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { image_url, title, description, category_id } = await req.json();
  if (!image_url) return NextResponse.json({ error: 'Image is required' }, { status: 400 });
  const { rows } = await pool.query(
    `INSERT INTO gallery (image_url, title, description, category_id, "order")
     VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX("order"),0)+1 FROM gallery))
     RETURNING *`,
    [image_url, title || null, description || null, category_id || null]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
