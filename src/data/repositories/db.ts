import {
  seedUsers, seedAdmins, seedPlayers, seedSports, seedTurfs, seedTurfImages,
  seedTurfSports, seedSlotsInitial, seedBookings, seedPayments, seedTeams,
  seedTeamMembers, seedJoinRequests, seedHistoricalSlots,
} from '../mock/seed';
import type { User } from '../models/user';
import type { Admin } from '../models/admin';
import type { Player } from '../models/player';
import type { Turf } from '../models/turf';
import type { TurfImage } from '../models/turfImage';
import type { Sport } from '../models/sport';
import type { TurfSport } from '../models/turfSport';
import type { TurfSlot } from '../models/turfSlot';
import type { Booking } from '../models/booking';
import type { Payment } from '../models/payment';
import type { Team } from '../models/team';
import type { TeamJoinRequest } from '../models/teamJoinRequest';
import type { TeamMember } from '../models/teamMember';

export interface DB {
  users: User[];
  admins: Admin[];
  players: Player[];
  sports: Sport[];
  turfs: Turf[];
  turfImages: TurfImage[];
  turfSports: TurfSport[];
  slots: TurfSlot[];
  bookings: Booking[];
  payments: Payment[];
  teams: Team[];
  teamMembers: TeamMember[];
  joinRequests: TeamJoinRequest[];
}

const LS_KEY = 'sportssync_db_v1';

function freshDB(): DB {
  return {
    users: structuredClone(seedUsers),
    admins: structuredClone(seedAdmins),
    players: structuredClone(seedPlayers),
    sports: structuredClone(seedSports),
    turfs: structuredClone(seedTurfs),
    turfImages: structuredClone(seedTurfImages),
    turfSports: structuredClone(seedTurfSports),
    slots: [...structuredClone(seedSlotsInitial), ...structuredClone(seedHistoricalSlots)],
    bookings: structuredClone(seedBookings),
    payments: structuredClone(seedPayments),
    teams: structuredClone(seedTeams),
    teamMembers: structuredClone(seedTeamMembers),
    joinRequests: structuredClone(seedJoinRequests),
  };
}

function loadDB(): DB {
  if (typeof localStorage === 'undefined') return freshDB();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return freshDB();
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.users || !parsed.turfs) return freshDB();
    for (const slot of seedHistoricalSlots) {
      if (!parsed.slots.some((existing) => existing.slot_id === slot.slot_id)) parsed.slots.push({ ...slot });
    }
    return parsed;
  } catch {
    return freshDB();
  }
}

export const db: DB = loadDB();

export function persistDB() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch {
    throw new Error('Browser storage is full. Remove some uploaded photos and try again.');
  }
}

export function resetDB() {
  const f = freshDB();
  Object.assign(db, f);
  persistDB();
}
