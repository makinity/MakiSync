import { z } from 'zod';

const MAX_FILE_SIZE_MAP = {
  image: 10 * 1024 * 1024,      // 10 MB
  video: 200 * 1024 * 1024,     // 200 MB
  document: 25 * 1024 * 1024,   // 25 MB
  brand_kit: 25 * 1024 * 1024,  // 25 MB
} as const;

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  brand_kit: ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'],
} as const;

export const uploadAssetSchema = z.object({
  client_id: z.string().uuid(),
  file_type: z.enum(['image', 'video', 'document', 'brand_kit']),
  file_name: z.string().min(1),
  file_url: z.string().url(),
  file_size: z.number().positive().optional(),
  mime_type: z.string().optional(),
});

export type UploadAssetInput = z.infer<typeof uploadAssetSchema>;

export { MAX_FILE_SIZE_MAP, ALLOWED_MIME_TYPES };
