import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { AnalyticsService } from '@/services/analytics.service';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let clientId: string | null = null;
  if (user.role === 'client') {
    const { rows } = await pool.query('SELECT id FROM clients WHERE user_id = $1', [user.id]);
    clientId = rows[0]?.id ?? null;
  }

  const [overview, byPlatform] = await Promise.all([
    AnalyticsService.getOverview(clientId ?? undefined),
    AnalyticsService.getByPlatform(clientId ?? undefined),
  ]);

  return NextResponse.json({ overview, byPlatform });
}
