import { z } from 'zod';

export const turfImageSchema = z.object({
  image_id: z.string(),
  turf_id: z.string(),
  image_url: z.string(),
  is_primary: z.boolean(),
  uploaded_at: z.string(),
});

export type TurfImage = z.infer<typeof turfImageSchema>;
