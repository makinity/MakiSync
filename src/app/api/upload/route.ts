import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_BUCKETS = ['profiles', 'projects', 'gallery', 'certifications', 'testimonials', 'general'];

// POST /api/upload?bucket=projects&path=covers/my-file.jpg
export async function POST(req: NextRequest) {
  const bucket = req.nextUrl.searchParams.get('bucket');
  const path   = req.nextUrl.searchParams.get('path');

  if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Auto-generate path if not provided: bucket/timestamp-filename
  const filePath = path ?? `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, { upsert: true, contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl, path: filePath });
}
