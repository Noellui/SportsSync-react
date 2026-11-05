import { z } from 'zod';

export const adminSchema = z.object({
  admin_id: z.string(),
  user_id: z.string(),
  contact_no: z.string(),
  register_date: z.string(),
});

export type Admin = z.infer<typeof adminSchema>;
