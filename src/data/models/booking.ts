import { z } from 'zod';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export const bookingSchema = z.object({
  booking_id: z.string(),
  player_id: z.string(),
  slot_id: z.string(),
  slot_ids: z.array(z.string()).default([]),
  booking_date: z.string(),
  booking_amount: z.number().nonnegative(),
  booking_status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
  cancellation_reason: z.string().nullable().default(null),
  player_count: z.number().int().min(1).default(1),
  per_player_amount: z.number().nonnegative(),
  shares_paid: z.number().int().min(0).optional(),
  collection_mode: z.enum(['share', 'full']).optional(),
  hold_expires_at: z.string().nullable().optional(),
});

export type Booking = z.infer<typeof bookingSchema>;
