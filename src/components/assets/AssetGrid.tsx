'use client';
import { Asset } from '@/types/asset.types';

interface AssetGridProps {
  assets: Asset[];
  fileType: string;
  onDelete?: (id: string) => void;
}

export default function AssetGrid({ assets, fileType, onDelete }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <i className="bi bi-folder text-4xl mb-3 block" />
        <p>No {fileType}s uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map(asset => (
        <div key={asset.id} className="bg-gray-900 border border-gray-800/50 rounded-xl overflow-hidden group hover:border-gray-700/50 transition-colors">
          {fileType === 'image' || fileType === 'brand_kit' ? (
            <div className="aspect-square bg-gray-800 relative">
              <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
              {onDelete && (
                <button
                  onClick={() => onDelete(asset.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="bi bi-trash text-xs" />
                </button>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-800 flex items-center justify-center">
              <i className={`bi ${fileType === 'video' ? 'bi-camera-reels' : 'bi-file-earmark-text'} text-3xl text-gray-500`} />
            </div>
          )}
          <div className="p-3">
            <p className="text-sm font-medium text-white truncate">{asset.file_name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {asset.file_size ? `${(asset.file_size / 1024 / 1024).toFixed(1)} MB` : ''} · {new Date(asset.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
