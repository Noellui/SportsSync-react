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

function requireCaptain(teamId: string, userId: string): Team {
  const team = db.teams.find((item) => item.team_id === teamId);
  if (!team) throw new Error('Team not found');
  if (!db.teamMembers.some((member) => member.team_id === teamId && member.user_id === userId && member.member_role === 'captain' && member.membership_status === 'active')) {
    throw new Error('Only the captain can manage this team');
  }
  return team;
}

function enrich(t: Team): TeamWithExtras {
  const sport = db.sports.find((s) => s.sport_id === t.sport_id);
  const members = db.teamMembers.filter((member, index, all) =>
    member.team_id === t.team_id && member.membership_status === 'active'
    && all.findIndex((other) => other.team_id === t.team_id && other.membership_status === 'active' && other.user_id === member.user_id) === index);
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

  async respondToRequest(requestId: string, accept: boolean, actorUserId: string): Promise<TeamJoinRequest> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const req = db.joinRequests.find((r) => r.request_id === requestId);
      if (!req) throw new Error('Request not found');
      const team = requireCaptain(req.team_id, actorUserId);
      if (req.request_status !== 'pending') throw new Error('Request already handled');
      if (accept && (team.team_status !== 'open' || enrich(team).member_count >= team.required_players)) throw new Error('Team is full or closed');
      req.request_status = accept ? 'accepted' : 'rejected';
      req.responded_at = new Date().toISOString().slice(0, 10);
      if (accept) {
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

  async removeMember(teamId: string, memberUserId: string, actorUserId: string): Promise<TeamWithExtras> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const team = requireCaptain(teamId, actorUserId);
      const member = db.teamMembers.find((item) => item.team_id === teamId && item.user_id === memberUserId && item.membership_status === 'active');
      if (!member || member.member_role === 'captain') throw new Error('This member cannot be removed');
      member.membership_status = 'left';
      if (team.team_status === 'full') team.team_status = 'open';
      persistDB();
      return enrich(team);
    })(), 8000, 'removeMember');
  },

  async updateTeam(teamId: string, actorUserId: string, patch: Partial<Pick<Team, 'team_name' | 'description' | 'required_players'>>): Promise<TeamWithExtras> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const team = requireCaptain(teamId, actorUserId);
      const name = patch.team_name?.trim() ?? team.team_name;
      const requiredPlayers = patch.required_players ?? team.required_players;
      if (!name) throw new Error('Team name is required');
      if (!Number.isInteger(requiredPlayers) || requiredPlayers < enrich(team).member_count || requiredPlayers > 22) throw new Error('Invalid team size');
      team.team_name = name;
      team.description = patch.description?.trim() ?? team.description;
      team.required_players = requiredPlayers;
      team.team_status = enrich(team).member_count >= requiredPlayers ? 'full' : 'open';
      persistDB();
      return enrich(team);
    })(), 8000, 'updateTeam');
  },

  async getMembers(teamId: string): Promise<TeamMember[]> {
    return withTimeout((async () => {
      await delay(250);
      return db.teamMembers.filter((m) => m.team_id === teamId && m.membership_status === 'active');
    })(), 8000, 'getMembers');
  },
};
