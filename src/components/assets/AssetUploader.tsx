'use client';
import { useState, useRef } from 'react';

interface AssetUploaderProps {
  fileType: string;
  clientId: string;
  onUpload: (asset: any) => void;
}

export default function AssetUploader({ fileType, clientId, onUpload }: AssetUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Upload to Supabase Storage via API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    formData.append('file_type', fileType);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Save asset record
      const assetRes = await fetch('/api/portal/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          file_name: file.name,
          file_url: data.url,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
        }),
      });
      const asset = await assetRes.json();
      onUpload(asset);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        accept={fileType === 'image' ? 'image/*' : fileType === 'video' ? 'video/*' : fileType === 'document' ? '.pdf,.doc,.docx' : 'image/*,.pdf'}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-[#1683DF] hover:bg-[#1683DF]/90 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : <><i className="bi bi-upload mr-1" />Upload</>}
      </button>
      {uploading && (
        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#1683DF] rounded-full transition-all" style={{ width: '60%' }} />
        </div>
      )}
    </div>
  );
}
