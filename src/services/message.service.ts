import pool from '@/lib/db';

export const MessageService = {
  async getThread(clientId: string) {
    const { rows } = await pool.query(`
      SELECT pm.*, u.username as sender_name
      FROM portal_messages pm
      JOIN users u ON u.id = pm.sender_id
      WHERE pm.client_id = $1
      ORDER BY pm.created_at ASC
    `, [clientId]);
    return rows;
  },

  async send(clientId: string, senderId: number, body: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO portal_messages (client_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
        [clientId, senderId, body]
      );
      // Notify the other party
      const { rows: clientRows } = await client.query('SELECT user_id FROM clients WHERE id = $1', [clientId]);
      const recipientId = senderId === clientRows[0]?.user_id
        ? (await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).rows[0]?.id
        : clientRows[0]?.user_id;
      if (recipientId) {
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, body, reference_id, reference_type)
           VALUES ($1, 'message_received', 'New Message', $2, $3, 'portal_message')`,
          [recipientId, body.substring(0, 100), rows[0].id]
        );
      }
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getUnreadCount(userId: number, clientId: string) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int as count FROM portal_messages WHERE is_read = false AND sender_id != $1 AND client_id = $2',
      [userId, clientId]
    );
    return rows[0]?.count ?? 0;
  },

  async markRead(clientId: string, userId: number) {
    await pool.query(
      'UPDATE portal_messages SET is_read = true WHERE client_id = $1 AND sender_id != $2 AND is_read = false',
      [clientId, userId]
    );
  },
};
