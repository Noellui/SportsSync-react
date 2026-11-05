import { z } from 'zod';

export type SkillLevel = 'beginner' | 'intermediate' | 'pro';

export const playerSchema = z.object({
  player_id: z.string(),
  user_id: z.string(),
  preferred_sport: z.string(),
  skill_level: z.enum(['beginner', 'intermediate', 'pro']),
  city: z.string(),
  bio: z.string().default(''),
});

export type Player = z.infer<typeof playerSchema>;
