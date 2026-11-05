import { db, persistDB } from './db';
import { delay, simulateLatency, withTimeout, randId } from '../../core/utils/withTimeout';
import type { Team } from '../models/team';
import type { TeamMember } from '../models/teamMember';
import type { TeamJoinRequest } from '../models/teamJoinRequest';

export interface TeamWithExtras extends Team {
  sport_name: string;
  sport_image: string;
  members: TeamMember[];
  member_count: number;
  captain_user_id: string;
  pending_requests: TeamJoinRequest[];
}

const sportImageMap: Record<string, string> = {
  s_football: '/images/sport_football.jpg',
  s_cricket: '/images/sport_cricket.jpg',
  s_basketball: '/images/sport_basketball.jpg',
  s_badminton: '/images/sport_badminton.jpg',
  s_tennis: '/images/sport_tennis.jpg',
  s_pickleball: '/images/sport_pickleball.jpg',
};

function enrich(t: Team): TeamWithExtras {
  const sport = db.sports.find((s) => s.sport_id === t.sport_id);
  const members = db.teamMembers.filter((m) => m.team_id === t.team_id && m.membership_status === 'active');
  const captain = members.find((m) => m.member_role === 'captain');
  const pending = db.joinRequests.filter((r) => r.team_id === t.team_id && r.request_status === 'pending');
  return {
    ...t,
    sport_name: sport?.sport_name ?? '',
    sport_image: sportImageMap[t.sport_id] ?? '',
    members,
    member_count: members.length,
    captain_user_id: captain?.user_id ?? t.created_by,
    pending_requests: pending,
  };
}

export const teamRepository = {
  async getTeams(sportId?: string): Promise<TeamWithExtras[]> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      let list = db.teams;
      if (sportId) list = list.filter((t) => t.sport_id === sportId);
      return list.map(enrich);
    })(), 8000, 'getTeams');
  },

  async getTeam(teamId: string): Promise<TeamWithExtras | null> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const t = db.teams.find((x) => x.team_id === teamId);
      return t ? enrich(t) : null;
    })(), 8000, 'getTeam');
  },

  async createTeam(input: {
    created_by: string; player_id: string; sport_id: string;
    team_name: string; description: string; required_players: number;
  }): Promise<Team> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const team: Team = {
        team_id: randId('team'),
        created_by: input.player_id,
        sport_id: input.sport_id,
        team_name: input.team_name,
        description: input.description,
        required_players: input.required_players,
        team_status: 'open',
        created_date: new Date().toISOString().slice(0, 10),
      };
      db.teams.push(team);
      db.teamMembers.push({
        team_member_id: randId('tm'),
        team_id: team.team_id,
        user_id: input.created_by,
        member_role: 'captain',
        joined_at: new Date().toISOString().slice(0, 10),
        membership_status: 'active',
      });
      persistDB();
      return team;
    })(), 8000, 'createTeam');
  },

  async sendJoinRequest(teamId: string, playerId: string, userId: string, message: string): Promise<TeamJoinRequest> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      if (db.teamMembers.some((m) => m.team_id === teamId && m.user_id === userId && m.membership_status === 'active')) {
        throw new Error('You are already a member of this team');
      }
      if (db.joinRequests.some((r) => r.team_id === teamId && r.player_id === playerId && r.request_status === 'pending')) {
        throw new Error('You already have a pending request');
      }
      const req: TeamJoinRequest = {
        request_id: randId('jr'),
        team_id: teamId,
        player_id: playerId,
        message,
        request_status: 'pending',
        requested_at: new Date().toISOString().slice(0, 10),
        responded_at: null,
      };
      db.joinRequests.push(req);
      persistDB();
      return req;
    })(), 8000, 'sendJoinRequest');
  },

  async respondToRequest(requestId: string, accept: boolean): Promise<TeamJoinRequest> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const req = db.joinRequests.find((r) => r.request_id === requestId);
      if (!req) throw new Error('Request not found');
      req.request_status = accept ? 'accepted' : 'rejected';
      req.responded_at = new Date().toISOString().slice(0, 10);
      if (accept) {
        const team = db.teams.find((t) => t.team_id === req.team_id);
        const player = db.players.find((p) => p.player_id === req.player_id);
        const user = db.users.find((u) => u.user_id === player?.user_id);
        if (team && player && user) {
          db.teamMembers.push({
            team_member_id: randId('tm'),
            team_id: team.team_id,
            user_id: user.user_id,
            member_role: 'member',
            joined_at: new Date().toISOString().slice(0, 10),
            membership_status: 'active',
          });
          const count = db.teamMembers.filter((m) => m.team_id === team.team_id && m.membership_status === 'active').length;
          if (count >= team.required_players) team.team_status = 'full';
        }
      }
      persistDB();
      return req;
    })(), 8000, 'respondToRequest');
  },

  async getMembers(teamId: string): Promise<TeamMember[]> {
    return withTimeout((async () => {
      await delay(250);
      return db.teamMembers.filter((m) => m.team_id === teamId && m.membership_status === 'active');
    })(), 8000, 'getMembers');
  },
};
