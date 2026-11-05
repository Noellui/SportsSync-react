import { beforeEach, describe, expect, it } from 'vitest';
import { authRepository } from './authRepository';
import { teamRepository } from './teamRepository';
import { db, resetDB } from './db';
import { turfRepository } from './turfRepository';

describe('demo flows', () => {
  beforeEach(() => resetDB());

  it('accepts both demo accounts and rejects a wrong password', async () => {
    expect((await authRepository.login('noellouis2005@gmail.com', '12345')).user.role).toBe('player');
    expect((await authRepository.login('admin@sportssync.com', 'admin123')).user.role).toBe('admin');
    await expect(authRepository.login('noellouis2005@gmail.com', 'wrong')).rejects.toThrow('Incorrect email or password');
  });

  it('creates a team with the creator as captain', async () => {
    const team = await teamRepository.createTeam({
      created_by: 'u_noel', player_id: 'p_noel', sport_id: db.sports[0].sport_id,
      team_name: 'Test Strikers', description: 'Weekend games', required_players: 5,
    });
    expect(team.team_name).toBe('Test Strikers');
    expect(db.teamMembers.some((member) => member.team_id === team.team_id && member.member_role === 'captain' && member.user_id === 'u_noel')).toBe(true);
  });

  it('returns fresh slot snapshots after an admin blocks one', async () => {
    const slot = db.slots.find((item) => item.slot_status === 'available')!;
    const before = await turfRepository.getSlots(slot.turf_id, slot.slot_date, slot.sport_id);
    await turfRepository.blockSlot(slot.slot_id, true);
    const after = await turfRepository.getSlots(slot.turf_id, slot.slot_date, slot.sport_id);
    expect(before.find((item) => item.slot_id === slot.slot_id)?.slot_status).toBe('available');
    expect(after.find((item) => item.slot_id === slot.slot_id)?.slot_status).toBe('blocked');
  });

  it('keeps venue and time data for completed and cancelled demo bookings', () => {
    for (const booking of db.bookings.filter((item) => item.booking_status === 'completed' || item.booking_status === 'cancelled')) {
      expect(db.slots.find((slot) => slot.slot_id === booking.slot_id), booking.booking_id).toBeDefined();
    }
  });
});
