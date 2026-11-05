import { z } from 'zod';

export type TurfStatus = 'active' | 'inactive' | 'maintenance';

export const turfSchema = z.object({
  turf_id: z.string(),
  admin_id: z.string(),
  turf_name: z.string().min(1),
  description: z.string(),
  opening_time: z.string(),
  closing_time: z.string(),
  turf_status: z.enum(['active', 'inactive', 'maintenance']),
  address: z.string(),
  city: z.string(),
  rating: z.number().min(0).max(5),
});

export type Turf = z.infer<typeof turfSchema>;
