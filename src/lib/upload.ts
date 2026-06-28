type Bucket = 'profiles' | 'projects' | 'gallery' | 'certifications' | 'testimonials' | 'general';

export async function uploadFile(bucket: Bucket, file: File, path?: string): Promise<string> {
  const params = new URLSearchParams({ bucket });
  if (path) params.set('path', path);

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(`/api/upload?${params}`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.url as string;
}
