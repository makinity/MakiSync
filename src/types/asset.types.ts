export type AssetType = 'image' | 'video' | 'document' | 'brand_kit';
export type MediaType = 'image' | 'video';

export interface Asset {
  id: string;
  client_id: string;
  uploaded_by: number;
  file_name: string;
  file_url: string;
  file_type: AssetType;
  file_size: number | null;
  mime_type: string | null;
  deleted_at: string | null;
  created_at: string;
}
