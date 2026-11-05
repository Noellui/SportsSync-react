import { z } from 'zod';

export type MemberRole = 'captain' | 'member';
export type MembershipStatus = 'active' | 'left';

export const teamMemberSchema = z.object({
  team_member_id: z.string(),
  team_id: z.string(),
  user_id: z.string(),
  member_role: z.enum(['captain', 'member']),
  joined_at: z.string(),
  membership_status: z.enum(['active', 'left']),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;
