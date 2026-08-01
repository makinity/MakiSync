export interface Client {
  id: string;
  user_id: number;
  business_name: string;
  industry: string | null;
  logo_url: string | null;
  brand_color_primary: string | null;
  brand_color_secondary: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
