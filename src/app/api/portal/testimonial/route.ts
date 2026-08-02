import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';
import { submitTestimonialSchema } from '@/lib/validations/testimonial.schema';

// ─── Auth helper ─────────────────────────────────────────────────────────────

/** Resolves the authenticated client user and their client_id. */
async function resolveClient(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user || user.role !== 'client') return null;

  const { rows } = await pool.query(
    'SELECT id, business_name, logo_url FROM clients WHERE user_id = $1 LIMIT 1',
    [user.id]
  );

  const client = rows[0];
  if (!client) return null;

  return { user, client };
}

// ─── GET /api/portal/testimonial ─────────────────────────────────────────────
// Returns the authenticated client's testimonial, or null if none exists yet.

export async function GET(req: NextRequest) {
  const resolved = await resolveClient(req);
  if (!resolved) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { client } = resolved;

  const { rows } = await pool.query(
    `SELECT id, client_name, client_title, client_avatar_url, message, rating, is_published, source, created_at, updated_at
     FROM testimonials
     WHERE client_id = $1
     LIMIT 1`,
    [client.id]
  );

  return NextResponse.json({ success: true, data: rows[0] ?? null });
}

// ─── POST /api/portal/testimonial ────────────────────────────────────────────
// Creates a new testimonial for the authenticated client.
// Auto-fills client_name and client_avatar_url from the client record.
// Returns 409 if the client has already submitted a testimonial.

export async function POST(req: NextRequest) {
  const resolved = await resolveClient(req);
  if (!resolved) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { client } = resolved;

  // Enforce one testimonial per client
  const { rows: existing } = await pool.query(
    'SELECT id FROM testimonials WHERE client_id = $1 LIMIT 1',
    [client.id]
  );
  if (existing.length > 0) {
    return NextResponse.json(
      { success: false, message: 'You have already submitted a testimonial. Use PUT to update it.' },
      { status: 409 }
    );
  }

  // Validate input
  const body = await req.json();
  const parsed = submitTestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'Validation failed.', errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { rating, message } = parsed.data;

  // Insert — auto-fill name and avatar from client record
  const { rows } = await pool.query(
    `INSERT INTO testimonials
       (client_name, client_title, client_avatar_url, message, rating, is_published, source, client_id)
     VALUES ($1, $2, $3, $4, $5, false, 'client', $6)
     RETURNING *`,
    [
      client.business_name,
      null,
      client.logo_url ?? null,
      message,
      rating,
      client.id,
    ]
  );

  return NextResponse.json(
    { success: true, message: 'Testimonial submitted successfully.', data: rows[0] },
    { status: 201 }
  );
}

// ─── PUT /api/portal/testimonial ─────────────────────────────────────────────
// Updates the authenticated client's existing testimonial.
// Returns 404 if no testimonial exists yet.

export async function PUT(req: NextRequest) {
  const resolved = await resolveClient(req);
  if (!resolved) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { client } = resolved;

  // Confirm testimonial exists
  const { rows: existing } = await pool.query(
    'SELECT id FROM testimonials WHERE client_id = $1 LIMIT 1',
    [client.id]
  );
  if (existing.length === 0) {
    return NextResponse.json(
      { success: false, message: 'No testimonial found. Use POST to submit one first.' },
      { status: 404 }
    );
  }

  // Validate input
  const body = await req.json();
  const parsed = submitTestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'Validation failed.', errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { rating, message } = parsed.data;

  // Update — reset is_published to false so admin re-reviews the updated review
  const { rows } = await pool.query(
    `UPDATE testimonials
     SET message     = $1,
         rating      = $2,
         is_published = false,
         updated_at  = NOW()
     WHERE client_id = $3
     RETURNING *`,
    [message, rating, client.id]
  );

  return NextResponse.json(
    { success: true, message: 'Testimonial updated successfully.', data: rows[0] }
  );
}
