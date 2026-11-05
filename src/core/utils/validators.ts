import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    phone_number: z.string().min(8, 'Enter a valid phone number'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirm_password: z.string(),
    role: z.enum(['player', 'admin']),
    preferred_sport: z.string().optional(),
    city: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const createTeamSchema = z.object({
  team_name: z.string().min(3, 'Team name is too short'),
  sport_id: z.string().min(1, 'Pick a sport'),
  required_players: z.number().int().min(2, 'At least 2 players'),
  description: z.string().max(300),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const turfFormSchema = z.object({
  turf_name: z.string().min(3, 'Name is required'),
  description: z.string().max(400).default(''),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  opening_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM'),
  closing_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM'),
  sport_ids: z.array(z.string()).min(1, 'Pick at least one sport'),
  image_urls: z.array(z.string()).min(1, 'Pick at least one image'),
  primary_image: z.string(),
});
export type TurfFormInput = z.infer<typeof turfFormSchema>;

export const generateSlotsSchema = z.object({
  turf_id: z.string().min(1),
  sport_id: z.string().min(1),
  start_hour: z.number().int().min(0).max(23),
  end_hour: z.number().int().min(1).max(24),
  price: z.number().min(100),
});
