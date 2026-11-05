import { z } from 'zod';

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export const teamJoinRequestSchema = z.object({
  request_id: z.string(),
  team_id: z.string(),
  player_id: z.string(),
  message: z.string(),
  request_status: z.enum(['pending', 'accepted', 'rejected']),
  requested_at: z.string(),
  responded_at: z.string().nullable().default(null),
});

export type TeamJoinRequest = z.infer<typeof teamJoinRequestSchema>;
