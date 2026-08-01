import pool from '@/lib/db';

export const AnalyticsService = {
  async getOverview(clientId?: string) {
    const clientFilter = clientId ? 'AND ci.client_id = $1' : '';
    const params = clientId ? [clientId] : [];

    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(a.impressions), 0)::int as total_impressions,
        COALESCE(SUM(a.reach), 0)::int as total_reach,
        COALESCE(SUM(a.likes + a.comments + a.shares + a.saves), 0)::int as total_engagements,
        COUNT(DISTINCT ci.id) FILTER (WHERE ci.status = 'published')::int as posts_published
      FROM content_items ci
      LEFT JOIN analytics_snapshots a ON a.content_item_id = ci.id
      WHERE ci.deleted_at IS NULL ${clientFilter}
    `, params);
    return rows[0];
  },

  async getByPlatform(clientId?: string) {
    const clientFilter = clientId ? 'AND ci.client_id = $1' : '';
    const params = clientId ? [clientId] : [];

    const { rows } = await pool.query(`
      SELECT
        ci.platform,
        COALESCE(SUM(a.impressions), 0)::int as impressions,
        COALESCE(SUM(a.reach), 0)::int as reach,
        COALESCE(SUM(a.likes), 0)::int as likes,
        COALESCE(SUM(a.comments), 0)::int as comments,
        COALESCE(SUM(a.shares), 0)::int as shares,
        COUNT(DISTINCT ci.id)::int as post_count
      FROM content_items ci
      LEFT JOIN analytics_snapshots a ON a.content_item_id = ci.id
      WHERE ci.deleted_at IS NULL ${clientFilter}
      GROUP BY ci.platform
      ORDER BY post_count DESC
    `, params);
    return rows;
  },

  async addSnapshot(contentItemId: string, data: {
    platform: string; impressions?: number; reach?: number;
    likes?: number; comments?: number; shares?: number; saves?: number; clicks?: number;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO analytics_snapshots (content_item_id, platform, impressions, reach, likes, comments, shares, saves, clicks, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'manual') RETURNING *`,
      [contentItemId, data.platform, data.impressions ?? 0, data.reach ?? 0,
       data.likes ?? 0, data.comments ?? 0, data.shares ?? 0, data.saves ?? 0, data.clicks ?? 0]
    );
    return rows[0];
  },
};
