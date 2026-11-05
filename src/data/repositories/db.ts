import {
  seedUsers, seedAdmins, seedPlayers, seedSports, seedTurfs, seedTurfImages,
  seedTurfSports, seedSlotsInitial, seedBookings, seedPayments, seedTeams,
  seedTeamMembers, seedJoinRequests, seedHistoricalSlots, DEMO_ADMIN_USER,
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
const SINGLE_VENUE_KEY = 'sportssync_single_venue_v1';

export function migrateSingleVenue(source: DB): DB {
  const migrated = structuredClone(source);
  const venue = migrated.turfs.find((item) => item.turf_id === 't_1') ?? seedTurfs[0];
  migrated.turfs = [{ ...venue, ...seedTurfs[0], opening_time: venue.opening_time, closing_time: venue.closing_time, turf_status: venue.turf_status }];
  migrated.turfSports = structuredClone(seedTurfSports);
  const images = migrated.turfImages.length ? migrated.turfImages : structuredClone(seedTurfImages);
  const primary = images.find((image) => image.turf_id === 't_1' && image.is_primary)?.image_id ?? images[0]?.image_id;
  migrated.turfImages = images.map((image) => ({ ...image, turf_id: 't_1', is_primary: image.image_id === primary }));
  const owner = migrated.users.find((user) => user.user_id === 'u_admin');
  if (owner) owner.full_name = DEMO_ADMIN_USER.full_name;
  migrated.players.forEach((player) => { if (player.city === 'Ahmedabad') player.city = 'Vadodara'; });

  const bookingSlotIds = new Set(migrated.bookings.flatMap((booking) => booking.slot_ids));
  migrated.slots = migrated.slots.filter((slot) => slot.turf_id === 't_1' || bookingSlotIds.has(slot.slot_id));
  const existingIds = new Set(migrated.slots.map((slot) => slot.slot_id));
  migrated.slots.push(...structuredClone(seedSlotsInitial).filter((slot) => !existingIds.has(slot.slot_id)));
  for (const booking of migrated.bookings) {
    if (booking.booking_status !== 'confirmed' && booking.booking_status !== 'pending') continue;
    for (const slotId of booking.slot_ids) {
      const bookedSlot = migrated.slots.find((slot) => slot.slot_id === slotId);
      if (!bookedSlot) continue;
      const currentSlot = migrated.slots.find((slot) => slot.turf_id === 't_1' && slot.sport_id === bookedSlot.sport_id && slot.slot_date === bookedSlot.slot_date && slot.start_time === bookedSlot.start_time);
      if (currentSlot) currentSlot.slot_status = 'booked';
    }
  }
  return migrated;
}

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
    let parsed = JSON.parse(raw) as DB;
    if (!parsed.users || !parsed.turfs) return freshDB();
    if (!localStorage.getItem(SINGLE_VENUE_KEY)) {
      parsed = migrateSingleVenue(parsed);
      localStorage.setItem(LS_KEY, JSON.stringify(parsed));
      localStorage.setItem(SINGLE_VENUE_KEY, '1');
    }
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
    localStorage.setItem(SINGLE_VENUE_KEY, '1');
  } catch {
    throw new Error('Browser storage is full. Remove some uploaded photos and try again.');
  }
}

export function resetDB() {
  const f = freshDB();
  Object.assign(db, f);
  persistDB();
}
