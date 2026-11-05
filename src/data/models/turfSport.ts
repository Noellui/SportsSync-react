import { z } from 'zod';

export const turfSportSchema = z.object({
  turf_id: z.string(),
  sport_id: z.string(),
});

export type TurfSport = z.infer<typeof turfSportSchema>;
