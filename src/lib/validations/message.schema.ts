import { z } from 'zod';

export const sendMessageSchema = z.object({
  client_id: z.string().uuid(),
  body: z.string().min(1, 'Message cannot be empty').max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
