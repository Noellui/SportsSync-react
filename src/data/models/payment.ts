import { z } from 'zod';

export type PaymentMethod = 'upi' | 'card' | 'cash' | 'wallet';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export const paymentSchema = z.object({
  payment_id: z.string(),
  booking_id: z.string(),
  payer_user_id: z.string().optional(),
  amount: z.number().nonnegative(),
  payment_method: z.enum(['upi', 'card', 'cash', 'wallet']),
  payment_status: z.enum(['success', 'pending', 'failed', 'refunded']),
  transaction_no: z.string(),
  payment_date: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
