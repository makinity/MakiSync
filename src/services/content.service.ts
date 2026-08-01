import pool from '@/lib/db';

export const ContentService = {
  async get(id: string) {
    const { rows } = await pool.query(
      `SELECT ci.*, c.business_name as client_name
       FROM content_items ci
       JOIN clients c ON c.id = ci.client_id
       WHERE ci.id = $1 AND ci.deleted_at IS NULL`,
      [id]
    );
    if (!rows[0]) return null;
    // Attach media
    const { rows: media } = await pool.query(
      'SELECT * FROM content_media WHERE content_item_id = $1 ORDER BY sort_order',
      [id]
    );
    return { ...rows[0], media };
  },

  async list(filters: { status?: string; client_id?: string; user_role?: string; user_id?: number }) {
    let query = `
      SELECT ci.*, c.business_name as client_name
      FROM content_items ci
      JOIN clients c ON c.id = ci.client_id
      WHERE ci.deleted_at IS NULL
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters.user_role === 'client') {
      const { rows } = await pool.query('SELECT id FROM clients WHERE user_id = $1', [filters.user_id]);
      if (rows[0]) {
        query += ` AND ci.client_id = $${idx++}`;
        params.push(rows[0].id);
      }
    } else if (filters.client_id) {
      query += ` AND ci.client_id = $${idx++}`;
      params.push(filters.client_id);
    }

    if (filters.status) {
      query += ` AND ci.status = $${idx++}`;
      params.push(filters.status);
    }

    query += ' ORDER BY ci.created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async create(data: { client_id: string; created_by: number; title: string; caption?: string; platform: string; notes?: string }) {
    const { rows } = await pool.query(
      `INSERT INTO content_items (client_id, created_by, title, caption, platform, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *`,
      [data.client_id, data.created_by, data.title, data.caption || null, data.platform, data.notes || null]
    );
    return rows[0];
  },

  async update(id: string, data: Record<string, any>) {
    const allowed = ['title', 'caption', 'platform', 'notes', 'status', 'scheduled_at'];
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const [k, v] of Object.entries(data)) {
      if (allowed.includes(k) && v !== undefined) {
        sets.push(`${k} = $${idx++}`);
        vals.push(v);
      }
    }
    if (sets.length === 0) return null;
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE content_items SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      vals
    );
    return rows[0] || null;
  },

  async schedule(id: string, scheduledAt: string) {
    const { rows } = await pool.query(
      `UPDATE content_items SET status = 'scheduled', scheduled_at = $2, updated_at = NOW()
       WHERE id = $1 AND status = 'approved' AND deleted_at IS NULL RETURNING *`,
      [id, scheduledAt]
    );
    return rows[0] || null;
  },

  async publish(id: string) {
    const { rows } = await pool.query(
      `UPDATE content_items SET status = 'published', published_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'scheduled' AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    return rows[0] || null;
  },

  async softDelete(id: string) {
    await pool.query(
      `UPDATE content_items SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  },
};
