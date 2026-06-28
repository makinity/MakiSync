import { createClient } from '@supabase/supabase-js';

// Uses service role key — server-side only
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'profiles';

export async function uploadAvatar(userId: number, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}.${ext}`;

  const { error } = await adminSupabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;
  return path;
}

export function getAvatarUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = adminSupabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
