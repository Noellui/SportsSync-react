import { z } from 'zod';

export type SlotStatus = 'available' | 'booked' | 'blocked';

export const turfSlotSchema = z.object({
  slot_id: z.string(),
  turf_id: z.string(),
  sport_id: z.string(),
  slot_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  price: z.number().nonnegative(),
  slot_status: z.enum(['available', 'booked', 'blocked']),
});

export type TurfSlot = z.infer<typeof turfSlotSchema>;
