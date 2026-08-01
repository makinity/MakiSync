import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import type { Client } from '@/types/client.types';

export const ClientService = {
  async listClients(): Promise<Client[]> {
    const { rows } = await pool.query<Client>(`
      SELECT c.*, u.username, u.email
      FROM clients c
      JOIN users u ON u.id = c.user_id
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
    `);
    return rows;
  },

  async getClient(clientId: string): Promise<Client | null> {
    const { rows } = await pool.query<Client>(`
      SELECT c.*, u.username, u.email
      FROM clients c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
    `, [clientId]);
    return rows[0] ?? null;
  },

  async getClientByUserId(userId: number): Promise<Client | null> {
    const { rows } = await pool.query<Client>(`
      SELECT * FROM clients WHERE user_id = $1 LIMIT 1
    `, [userId]);
    return rows[0] ?? null;
  },

  async createClient(data: {
    business_name: string;
    industry?: string;
    notes?: string;
    username: string;
    email: string;
    password: string;
  }): Promise<Client> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const passwordHash = await hashPassword(data.password);

      // Create the user account with role = 'client'
      const { rows: userRows } = await client.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, 'client')
         RETURNING id`,
        [data.username, data.email, passwordHash]
      );
      const userId: number = userRows[0].id;

      // Create the client business profile
      const { rows: clientRows } = await client.query<Client>(
        `INSERT INTO clients (user_id, business_name, industry, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, data.business_name, data.industry ?? null, data.notes ?? null]
      );

      await client.query('COMMIT');
      return clientRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateClient(clientId: string, data: Partial<{
    business_name: string;
    industry: string;
    logo_url: string;
    brand_color_primary: string;
    brand_color_secondary: string;
    notes: string;
    is_active: boolean;
  }>): Promise<Client | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(val);
      }
    }
    if (fields.length === 0) return ClientService.getClient(clientId);

    fields.push(`updated_at = NOW()`);
    values.push(clientId);

    const { rows } = await pool.query<Client>(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  },
};
