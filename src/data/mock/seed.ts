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
import { addDays, format, subDays } from 'date-fns';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const now = new Date();

export const DEMO_PLAYER_USER: User = {
  user_id: 'u_noel',
  full_name: 'Noel Louis',
  email: 'noellouis2005@gmail.com',
  phone_number: '+91 98765 43210',
  password_hash: '12345',
  role: 'player',
  registration_date: iso(subDays(now, 200)),
  account_status: 'active',
};

export const DEMO_ADMIN_USER: User = {
  user_id: 'u_admin',
  full_name: 'Arena Admin',
  email: 'admin@sportssync.com',
  phone_number: '+91 90000 11111',
  password_hash: 'admin123',
  role: 'admin',
  registration_date: iso(subDays(now, 400)),
  account_status: 'active',
};

const extraPlayerData: Array<{
  name: string; email: string; sport: string; skill: 'beginner' | 'intermediate' | 'pro'; bio: string;
}> = [
  { name: 'Aarav Patel', email: 'aarav.p@example.com', sport: 'Football', skill: 'pro', bio: 'Defender. Hard tackler, faster kicker.' },
  { name: 'Ishita Rao', email: 'ishita.r@example.com', sport: 'Badminton', skill: 'intermediate', bio: 'Weekend smash queen.' },
  { name: 'Kabir Shah', email: 'kabir.s@example.com', sport: 'Cricket', skill: 'beginner', bio: 'Learning the art of cover drive.' },
  { name: 'Meera Joshi', email: 'meera.j@example.com', sport: 'Basketball', skill: 'pro', bio: 'Point guard. Loves fast break.' },
  { name: 'Rohan Mehta', email: 'rohan.m@example.com', sport: 'Tennis', skill: 'intermediate', bio: 'Baseline grinder.' },
  { name: 'Sana Khan', email: 'sana.k@example.com', sport: 'Pickleball', skill: 'beginner', bio: 'New to the game, loving it.' },
];

export const extraUsers: User[] = extraPlayerData.map((p, i) => ({
  user_id: `u_p${i + 1}`,
  full_name: p.name,
  email: p.email,
  phone_number: `+91 9${8000 + i} ${43000 + i * 111}`,
  password_hash: 'pass1234',
  role: 'player',
  registration_date: iso(subDays(now, 100 + i * 10)),
  account_status: 'active',
}));

export const seedAdmins: Admin[] = [
  { admin_id: 'a_1', user_id: 'u_admin', contact_no: '+91 90000 11111', register_date: iso(subDays(now, 400)) },
];

export const seedPlayers: Player[] = [
  { player_id: 'p_noel', user_id: 'u_noel', preferred_sport: 'Football', skill_level: 'intermediate', city: 'Ahmedabad', bio: 'Weekend striker. Always up for a 5-a-side.' },
  ...extraPlayerData.map((p, i) => ({
    player_id: `p_${i + 1}`,
    user_id: `u_p${i + 1}`,
    preferred_sport: p.sport,
    skill_level: p.skill,
    city: 'Ahmedabad',
    bio: p.bio,
  })),
];

export const seedSports: Sport[] = [
  { sport_id: 's_football', sport_name: 'Football', description: '5-a-side and 11-a-side football on premium turf.', sport_status: 'active' },
  { sport_id: 's_cricket', sport_name: 'Cricket', description: 'Practice nets and indoor cricket.', sport_status: 'active' },
  { sport_id: 's_basketball', sport_name: 'Basketball', description: 'Full and half courts for pickup games.', sport_status: 'active' },
  { sport_id: 's_badminton', sport_name: 'Badminton', description: 'Indoor courts with proper flooring.', sport_status: 'active' },
  { sport_id: 's_tennis', sport_name: 'Tennis', description: 'Harden and turf tennis courts.', sport_status: 'active' },
  { sport_id: 's_pickleball', sport_name: 'Pickleball', description: 'Fast-growing racket sport, all ages.', sport_status: 'active' },
];

const turfDefs = [
  { id: 't_1', name: 'Green Arena', area: 'Satellite', city: 'Ahmedabad', status: 'active' as const, rating: 4.8, sports: ['s_football'], images: ['turf_1.jpg', 'sport_football.jpg', 'turf_4.jpg'] },
  { id: 't_2', name: "Striker's Den", area: 'Bopal', city: 'Ahmedabad', status: 'active' as const, rating: 4.6, sports: ['s_football', 's_cricket'], images: ['turf_2.jpg', 'sport_cricket.jpg', 'sport_football.jpg'] },
  { id: 't_3', name: 'Dunk Dome', area: 'SG Highway', city: 'Ahmedabad', status: 'active' as const, rating: 4.4, sports: ['s_basketball', 's_pickleball'], images: ['turf_3.jpg', 'sport_basketball.jpg', 'sport_pickleball.jpg'] },
  { id: 't_4', name: 'Smash Court', area: 'Prahlad Nagar', city: 'Ahmedabad', status: 'active' as const, rating: 4.5, sports: ['s_badminton', 's_tennis'], images: ['turf_4.jpg', 'sport_badminton.jpg', 'sport_tennis.jpg'] },
  { id: 't_5', name: 'Pitch Perfect', area: 'Maninagar', city: 'Ahmedabad', status: 'maintenance' as const, rating: 4.2, sports: ['s_cricket', 's_football'], images: ['turf_5.jpg', 'sport_cricket.jpg'] },
  { id: 't_6', name: 'Night Owl Turf', area: 'Vastrapur', city: 'Ahmedabad', status: 'active' as const, rating: 4.9, sports: ['s_football', 's_badminton', 's_tennis'], images: ['turf_6.jpg', 'sport_football.jpg', 'sport_badminton.jpg', 'sport_tennis.jpg'] },
];

export const seedTurfs: Turf[] = turfDefs.map((t) => ({
  turf_id: t.id,
  admin_id: 'a_1',
  turf_name: t.name,
  description: `${t.name} is a premium ${t.sports.length > 1 ? 'multi-sport' : 'purpose-built'} venue in ${t.area}, Ahmedabad. Floodlit, well-maintained and open late for night games.`,
  opening_time: '06:00',
  closing_time: '23:00',
  turf_status: t.status,
  address: `${t.area}, Ahmedabad, Gujarat`,
  city: t.city,
  rating: t.rating,
}));

export const seedTurfImages: TurfImage[] = turfDefs.flatMap((t) =>
  t.images.map((img, i) => ({
    image_id: `img_${t.id}_${i + 1}`,
    turf_id: t.id,
    image_url: `/images/${img}`,
    is_primary: i === 0,
    uploaded_at: iso(subDays(now, 300)),
  })),
);

export const seedTurfSports: TurfSport[] = turfDefs.flatMap((t) =>
  t.sports.map((s) => ({ turf_id: t.id, sport_id: s })),
);

// ---- Slots: next 7 days, 6:00 to 23:00, 1-hour slots per turf+sport ----
function seedSlots(): TurfSlot[] {
  const slots: TurfSlot[] = [];
  for (const t of turfDefs) {
    if (t.status === 'maintenance') continue;
    for (const sportId of t.sports) {
      for (let d = 0; d < 7; d++) {
        const date = iso(addDays(now, d));
        const weekend = [0, 6].includes(new Date(date).getDay());
        for (let h = 6; h < 23; h++) {
          const start = `${String(h).padStart(2, '0')}:00`;
          const end = `${String(h + 1).padStart(2, '0')}:00`;
          let price = 800;
          if (h >= 18 && h < 21) price += 400; // peak
          if (weekend) price += 300;
          if (sportId === 's_cricket') price = Math.max(600, price - 200);
          price = Math.min(1800, price);
          // ~30% booked: deterministic pseudo-random by (turf, sport, day, hour)
          const seedNum = (t.id.charCodeAt(2) * 7 + sportId.charCodeAt(2) * 13 + d * 31 + h * 17) % 10;
          const status = seedNum < 3 ? 'booked' as const : 'available' as const;
          slots.push({
            slot_id: `slot_${t.id}_${sportId.slice(2)}_${date}_${h}`,
            turf_id: t.id,
            sport_id: sportId,
            slot_date: date,
            start_time: start,
            end_time: end,
            price,
            slot_status: status,
          });
        }
      }
    }
  }
  return slots;
}

export const seedSlotsInitial = seedSlots();

// ---- Bookings for demo player (p_noel) ----
const upcoming1Date = addDays(now, 2);
const upcoming2Date = addDays(now, 5);

export const seedBookings: Booking[] = [
  {
    booking_id: 'b_up1',
    player_id: 'p_noel',
    slot_id: 'slot_t_1_football_' + iso(upcoming1Date) + '_18',
    slot_ids: ['slot_t_1_football_' + iso(upcoming1Date) + '_18', 'slot_t_1_football_' + iso(upcoming1Date) + '_19'],
    booking_date: iso(subDays(now, 1)),
    booking_amount: 3200,
    booking_status: 'confirmed',
    cancellation_reason: null,
    player_count: 4,
    per_player_amount: 800,
  },
  {
    booking_id: 'b_up2',
    player_id: 'p_noel',
    slot_id: 'slot_t_6_football_' + iso(upcoming2Date) + '_20',
    slot_ids: ['slot_t_6_football_' + iso(upcoming2Date) + '_20'],
    booking_date: iso(subDays(now, 2)),
    booking_amount: 1500,
    booking_status: 'confirmed',
    cancellation_reason: null,
    player_count: 1,
    per_player_amount: 1500,
  },
  {
    booking_id: 'b_done1',
    player_id: 'p_noel',
    slot_id: 'slot_t_2_cricket_' + iso(subDays(now, 6)) + '_17',
    slot_ids: ['slot_t_2_cricket_' + iso(subDays(now, 6)) + '_17'],
    booking_date: iso(subDays(now, 7)),
    booking_amount: 1200,
    booking_status: 'completed',
    cancellation_reason: null,
    player_count: 2,
    per_player_amount: 600,
  },
  {
    booking_id: 'b_done2',
    player_id: 'p_noel',
    slot_id: 'slot_t_4_badminton_' + iso(subDays(now, 12)) + '_19',
    slot_ids: ['slot_t_4_badminton_' + iso(subDays(now, 12)) + '_19'],
    booking_date: iso(subDays(now, 13)),
    booking_amount: 900,
    booking_status: 'completed',
    cancellation_reason: null,
    player_count: 1,
    per_player_amount: 900,
  },
  {
    booking_id: 'b_done3',
    player_id: 'p_noel',
    slot_id: 'slot_t_6_football_' + iso(subDays(now, 20)) + '_18',
    slot_ids: ['slot_t_6_football_' + iso(subDays(now, 20)) + '_18'],
    booking_date: iso(subDays(now, 21)),
    booking_amount: 2600,
    booking_status: 'completed',
    cancellation_reason: null,
    player_count: 3,
    per_player_amount: 867,
  },
  {
    booking_id: 'b_cancel1',
    player_id: 'p_noel',
    slot_id: 'slot_t_1_football_' + iso(subDays(now, 3)) + '_18',
    slot_ids: ['slot_t_1_football_' + iso(subDays(now, 3)) + '_18'],
    booking_date: iso(subDays(now, 4)),
    booking_amount: 1400,
    booking_status: 'cancelled',
    cancellation_reason: 'Rain forecast',
    player_count: 1,
    per_player_amount: 1400,
  },
];

export const seedHistoricalSlots: TurfSlot[] = seedBookings
  .filter((booking) => booking.booking_status === 'completed' || booking.booking_status === 'cancelled')
  .flatMap((booking) => booking.slot_ids.map((slotId) => {
    const match = /^slot_(t_\d+)_(.+)_(\d{4}-\d{2}-\d{2})_(\d{1,2})$/.exec(slotId);
    if (!match) throw new Error(`Invalid seed slot ID: ${slotId}`);
    const [, turfId, sport, date, hourText] = match;
    const hour = Number(hourText);
    return {
      slot_id: slotId,
      turf_id: turfId,
      sport_id: `s_${sport}`,
      slot_date: date,
      start_time: `${String(hour).padStart(2, '0')}:00`,
      end_time: `${String(hour + 1).padStart(2, '0')}:00`,
      price: booking.booking_amount,
      slot_status: booking.booking_status === 'cancelled' ? 'available' as const : 'booked' as const,
    };
  }));

export const seedPayments: Payment[] = [
  { payment_id: 'pay_up1', booking_id: 'b_up1', amount: 800, payment_method: 'upi', payment_status: 'success', transaction_no: 'TXN9A2B3C4D', payment_date: iso(subDays(now, 1)) },
  { payment_id: 'pay_up2', booking_id: 'b_up2', amount: 1500, payment_method: 'card', payment_status: 'success', transaction_no: 'TXN1F2E3D4C', payment_date: iso(subDays(now, 2)) },
  { payment_id: 'pay_done1', booking_id: 'b_done1', amount: 1200, payment_method: 'upi', payment_status: 'success', transaction_no: 'TXN5A6B7C8D', payment_date: iso(subDays(now, 7)) },
  { payment_id: 'pay_done2', booking_id: 'b_done2', amount: 900, payment_method: 'wallet', payment_status: 'success', transaction_no: 'TXN2C3D4E5F', payment_date: iso(subDays(now, 13)) },
  { payment_id: 'pay_done3', booking_id: 'b_done3', amount: 2600, payment_method: 'upi', payment_status: 'success', transaction_no: 'TXN6E7F8A9B', payment_date: iso(subDays(now, 21)) },
  { payment_id: 'pay_cancel1', booking_id: 'b_cancel1', amount: 1400, payment_method: 'card', payment_status: 'refunded', transaction_no: 'TXN7B8C9D0E', payment_date: iso(subDays(now, 4)) },
];

// ---- Teams ----
export const seedTeams: Team[] = [
  { team_id: 'team_1', created_by: 'p_noel', sport_id: 's_football', team_name: 'Friday Night Strikers', description: '5-a-side squad for Friday nights. Intermediate to pro.', required_players: 10, team_status: 'open', created_date: iso(subDays(now, 40)) },
  { team_id: 'team_2', created_by: 'p_1', sport_id: 's_cricket', team_name: 'Ahmedabad Overs', description: 'Casual cricket crew, all levels welcome.', required_players: 8, team_status: 'open', created_date: iso(subDays(now, 30)) },
  { team_id: 'team_3', created_by: 'p_2', sport_id: 's_badminton', team_name: 'Smash Sisters', description: 'Badminton doubles group, weekend games.', required_players: 6, team_status: 'full', created_date: iso(subDays(now, 60)) },
  { team_id: 'team_4', created_by: 'p_4', sport_id: 's_basketball', team_name: 'Dunk Squad', description: 'Half-court pickup, SG Highway. Bring your A game.', required_players: 10, team_status: 'closed', created_date: iso(subDays(now, 90)) },
];

export const seedTeamMembers: TeamMember[] = [
  { team_member_id: 'tm_1_1', team_id: 'team_1', user_id: 'u_noel', member_role: 'captain', joined_at: iso(subDays(now, 40)), membership_status: 'active' },
  { team_member_id: 'tm_1_2', team_id: 'team_1', user_id: 'u_p1', member_role: 'member', joined_at: iso(subDays(now, 35)), membership_status: 'active' },
  { team_member_id: 'tm_1_3', team_id: 'team_1', user_id: 'u_p5', member_role: 'member', joined_at: iso(subDays(now, 20)), membership_status: 'active' },
  { team_member_id: 'tm_1_4', team_id: 'team_1', user_id: 'u_p6', member_role: 'member', joined_at: iso(subDays(now, 10)), membership_status: 'active' },
  { team_member_id: 'tm_2_1', team_id: 'team_2', user_id: 'u_p1', member_role: 'captain', joined_at: iso(subDays(now, 30)), membership_status: 'active' },
  { team_member_id: 'tm_2_2', team_id: 'team_2', user_id: 'u_p3', member_role: 'member', joined_at: iso(subDays(now, 25)), membership_status: 'active' },
  { team_member_id: 'tm_2_3', team_id: 'team_2', user_id: 'u_noel', member_role: 'member', joined_at: iso(subDays(now, 15)), membership_status: 'active' },
  { team_member_id: 'tm_3_1', team_id: 'team_3', user_id: 'u_p2', member_role: 'captain', joined_at: iso(subDays(now, 60)), membership_status: 'active' },
  { team_member_id: 'tm_3_2', team_id: 'team_3', user_id: 'u_p6', member_role: 'member', joined_at: iso(subDays(now, 55)), membership_status: 'active' },
  { team_member_id: 'tm_3_3', team_id: 'team_3', user_id: 'u_p1', member_role: 'member', joined_at: iso(subDays(now, 50)), membership_status: 'active' },
  { team_member_id: 'tm_3_4', team_id: 'team_3', user_id: 'u_p4', member_role: 'member', joined_at: iso(subDays(now, 45)), membership_status: 'active' },
  { team_member_id: 'tm_3_5', team_id: 'team_3', user_id: 'u_p5', member_role: 'member', joined_at: iso(subDays(now, 40)), membership_status: 'active' },
  { team_member_id: 'tm_3_6', team_id: 'team_3', user_id: 'u_p3', member_role: 'member', joined_at: iso(subDays(now, 35)), membership_status: 'active' },
  { team_member_id: 'tm_4_1', team_id: 'team_4', user_id: 'u_p4', member_role: 'captain', joined_at: iso(subDays(now, 90)), membership_status: 'active' },
  { team_member_id: 'tm_4_2', team_id: 'team_4', user_id: 'u_p5', member_role: 'member', joined_at: iso(subDays(now, 80)), membership_status: 'active' },
];

export const seedJoinRequests: TeamJoinRequest[] = [
  { request_id: 'jr_1', team_id: 'team_1', player_id: 'p_2', message: 'I play striker too, want to join your Friday nights!', request_status: 'pending', requested_at: iso(subDays(now, 1)), responded_at: null },
  { request_id: 'jr_2', team_id: 'team_2', player_id: 'p_6', message: 'Beginner here, looking for a friendly crew.', request_status: 'pending', requested_at: iso(subDays(now, 2)), responded_at: null },
  { request_id: 'jr_3', team_id: 'team_3', player_id: 'p_noel', message: 'Switched to badminton recently, any room?', request_status: 'pending', requested_at: iso(subDays(now, 3)), responded_at: null },
];

export const seedUsers: User[] = [DEMO_PLAYER_USER, DEMO_ADMIN_USER, ...extraUsers];
