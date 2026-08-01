import pool from '@/lib/db';

export const AssetService = {
  async list(clientId: string, fileType?: string) {
    let query = 'SELECT * FROM assets WHERE client_id = $1 AND deleted_at IS NULL';
    const params: any[] = [clientId];
    if (fileType) {
      query += ' AND file_type = $2';
      params.push(fileType);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    return rows;
  },

  async create(data: { client_id: string; uploaded_by: number; file_name: string; file_url: string; file_type: string; file_size?: number; mime_type?: string }) {
    const { rows } = await pool.query(
      `INSERT INTO assets (client_id, uploaded_by, file_name, file_url, file_type, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.client_id, data.uploaded_by, data.file_name, data.file_url, data.file_type, data.file_size || null, data.mime_type || null]
    );
    return rows[0];
  },

  async softDelete(id: string) {
    await pool.query('UPDATE assets SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [id]);
  },
};
