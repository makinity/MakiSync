import { z } from 'zod';

export const submitTestimonialSchema = z.object({
  rating:  z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
});

export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>;
