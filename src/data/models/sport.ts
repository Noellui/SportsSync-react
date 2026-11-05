import { z } from 'zod';

export type SportStatus = 'active' | 'inactive';

export const sportSchema = z.object({
  sport_id: z.string(),
  sport_name: z.string().min(1),
  description: z.string(),
  sport_status: z.enum(['active', 'inactive']),
});

export type Sport = z.infer<typeof sportSchema>;
