import { ContentStatus } from '@/constants/contentStatus';
import { Platform } from '@/constants/platforms';
import { MediaType } from '@/types/asset.types';

export interface ContentItem {
  id: string;
  client_id: string;
  created_by: number;
  title: string;
  caption: string | null;
  status: ContentStatus;
  platform: Platform;
  scheduled_at: string | null;
  published_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  media?: ContentMedia[];
  comments?: ContentComment[];
  client_name?: string;
}

export interface ContentMedia {
  id: string;
  content_item_id: string;
  file_url: string;
  file_type: MediaType;
  file_name: string;
  file_size: number | null;
  sort_order: number;
  created_at: string;
}

export interface ContentComment {
  id: string;
  content_item_id: string;
  author_id: number;
  body: string;
  is_change_request: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  author_name?: string;
}
