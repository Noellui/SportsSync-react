import { z } from 'zod';

export type TeamStatus = 'open' | 'full' | 'closed';

export const teamSchema = z.object({
  team_id: z.string(),
  created_by: z.string(),
  sport_id: z.string(),
  team_name: z.string().min(1),
  description: z.string(),
  required_players: z.number().int().min(2),
  team_status: z.enum(['open', 'full', 'closed']),
  created_date: z.string(),
});

export type Team = z.infer<typeof teamSchema>;
