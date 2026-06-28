import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [
      projects, messages, testimonials, certifications,
      projectsByStatus, messagesChart, recentMessages, recentProjects, profile
    ] = await Promise.all([
      // Stat cards
      client.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='published') published, COUNT(*) FILTER (WHERE status='draft') draft FROM projects`),
      client.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE is_read=false) unread FROM messages`),
      client.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE is_published=true) published FROM testimonials`),
      client.query(`SELECT COUNT(*) total FROM certifications`),

      // Donut: projects by status
      client.query(`SELECT status, COUNT(*) count FROM projects GROUP BY status`),

      // Line: messages last 30 days
      client.query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),

      // Recent messages (last 5 unread)
      client.query(`SELECT id, sender_name, sender_email, subject, created_at FROM messages ORDER BY created_at DESC LIMIT 5`),

      // Recent projects (last 5)
      client.query(`SELECT id, title, status, created_at FROM projects ORDER BY created_at DESC LIMIT 5`),

      // Profile completion
      client.query(`SELECT full_name, tagline, bio, avatar_url, location, years_experience FROM profile WHERE id=1`),
    ]);

    // Build 30-day chart with zero-fill
    const today = new Date();
    const chartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      const found = messagesChart.rows.find((r: any) => r.date?.toISOString?.().split('T')[0] === key || r.date === key);
      return { date: key.slice(5), count: found ? parseInt(found.count) : 0 };
    });

    // Profile completion %
    const p = profile.rows[0] ?? {};
    const fields = ['full_name', 'tagline', 'bio', 'avatar_url', 'location', 'years_experience'];
    const filled = fields.filter(f => p[f] != null && p[f] !== '').length;
    const profileCompletion = Math.round((filled / fields.length) * 100);

    return NextResponse.json({
      stats: {
        projects: { total: +projects.rows[0].total, published: +projects.rows[0].published, draft: +projects.rows[0].draft },
        messages: { total: +messages.rows[0].total, unread: +messages.rows[0].unread },
        testimonials: { total: +testimonials.rows[0].total, published: +testimonials.rows[0].published },
        certifications: +certifications.rows[0].total,
      },
      projectsByStatus: projectsByStatus.rows.map((r: any) => ({ name: r.status, value: +r.count })),
      messagesChart: chartData,
      recentMessages: recentMessages.rows,
      recentProjects: recentProjects.rows,
      profileCompletion,
    });
  } finally {
    client.release();
  }
}
