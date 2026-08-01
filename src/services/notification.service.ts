import pool from '@/lib/db';
import type { Notification, NotificationType } from '@/types/notification.types';

export const NotificationService = {
  async createNotification(data: {
    recipient_id: number;
    type: NotificationType;
    title: string;
    body?: string;
    reference_id?: string;
    reference_type?: string;
  }): Promise<Notification> {
    const { rows } = await pool.query<Notification>(
      `INSERT INTO notifications (recipient_id, type, title, body, reference_id, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.recipient_id,
        data.type,
        data.title,
        data.body ?? null,
        data.reference_id ?? null,
        data.reference_type ?? null,
      ]
    );
    return rows[0];
  },

  async listNotifications(userId: number, onlyUnread = false): Promise<Notification[]> {
    const query = onlyUnread
      ? `SELECT * FROM notifications WHERE recipient_id = $1 AND is_read = false ORDER BY created_at DESC`
      : `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC`;

    const { rows } = await pool.query<Notification>(query, [userId]);
    return rows;
  },

  async getUnreadCount(userId: number): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  },

  async markAllRead(userId: number): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE recipient_id = $1 AND is_read = false`,
      [userId]
    );
  },

  async markRead(notificationId: string): Promise<void> {
    await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [notificationId]);
  },
};
