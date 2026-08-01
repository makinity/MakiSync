import { z } from 'zod';

export const createContentSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  caption: z.string().max(2200).optional(),
  platform: z.enum(['facebook', 'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube']),
  notes: z.string().max(1000).optional(),
  scheduled_at: z.string().datetime().optional(),
});

export const updateContentSchema = createContentSchema.partial().extend({
  status: z.enum(['draft', 'proposed', 'approved', 'scheduled', 'published', 'archived']).optional(),
});

export const approveContentSchema = z.object({
  comment: z.string().max(1000).optional(),
});

export const rejectContentSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000),
});

export const requestChangesSchema = z.object({
  comment: z.string().min(1, 'Comment is required').max(1000),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
