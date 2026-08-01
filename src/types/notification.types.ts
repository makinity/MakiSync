export type NotificationType =
  | 'content_proposed'
  | 'content_approved'
  | 'content_rejected'
  | 'content_changes_requested'
  | 'content_published'
  | 'content_scheduled'
  | 'message_received'
  | 'asset_uploaded';

export interface Notification {
  id: string;
  recipient_id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}
