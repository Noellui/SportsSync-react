import { z } from 'zod';

export const UserRole = { Admin: 'admin', Player: 'player' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type AccountStatus = 'active' | 'suspended';

export const userSchema = z.object({
  user_id: z.string(),
  full_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string(),
  profile_image: z.string().optional(),
  password_hash: z.string(),
  role: z.enum(['admin', 'player']),
  registration_date: z.string(),
  account_status: z.enum(['active', 'suspended']),
});

export type User = z.infer<typeof userSchema>;
