import { beforeEach, describe, expect, it } from 'vitest';
import { authRepository } from './authRepository';
import { teamRepository } from './teamRepository';
import { db, resetDB, migrateSingleVenue } from './db';
import { turfRepository } from './turfRepository';
import { addDays, format } from 'date-fns';

describe('demo flows', () => {
  beforeEach(() => resetDB());

  it('accepts both demo accounts and rejects a wrong password', async () => {
    expect((await authRepository.login('noellouis2005@gmail.com', '12345')).user.role).toBe('player');
    expect((await authRepository.login('admin@sportssync.com', 'admin123')).user.role).toBe('admin');
    await expect(authRepository.login('noellouis2005@gmail.com', 'wrong')).rejects.toThrow('Incorrect email or password');
  });

  it('seeds one Manjalpur Sports venue with all six sports for the owner admin', () => {
    expect(db.admins).toHaveLength(1);
    expect(db.turfs).toHaveLength(1);
    expect(db.turfs[0].turf_name).toBe('Manjalpur Sports');
    expect(db.turfs[0].city).toBe('Vadodara');
    expect(db.turfSports.filter((item) => item.turf_id === db.turfs[0].turf_id)).toHaveLength(6);
    expect(db.bookings.every((booking) => booking.slot_ids.every((slotId) => db.slots.find((slot) => slot.slot_id === slotId)?.turf_id === db.turfs[0].turf_id))).toBe(true);
  });

  it('does not let public registration create another owner admin', async () => {
    await expect(authRepository.register({ full_name: 'Another Owner', email: 'owner2@example.com', phone_number: '1234567890', password: 'secret', role: 'admin' })).rejects.toThrow('owner');
    expect(db.admins).toHaveLength(1);
  });

  it('keeps the sole venue while allowing its owner to edit it', async () => {
    await expect(turfRepository.createTurf('a_1', {
      turf_name: 'Second venue', description: '', address: '', city: 'Vadodara', opening_time: '06:00', closing_time: '23:00', sport_ids: ['s_football'], image_urls: [], primary_image: '',
    })).rejects.toThrow('one venue');
    await expect(turfRepository.deleteTurf('t_1')).rejects.toThrow('only venue');
    await turfRepository.updateTurf('t_1', { description: 'Updated owner description' });
    expect(db.turfs).toHaveLength(1);
    expect(db.turfs[0].description).toBe('Updated owner description');
  });

  it('keeps an inactive venue visible to the owner but hidden from players', async () => {
    await turfRepository.updateTurf('t_1', { turf_status: 'inactive' });
    expect(await turfRepository.getTurfs()).toHaveLength(0);
    expect((await turfRepository.getTurfs({ includeInactive: true })).map((turf) => turf.turf_id)).toEqual(['t_1']);
  });

  it('migrates old browser data without losing bookings or uploaded photos', () => {
    const old = structuredClone(db);
    const canonical = old.slots.find((slot) => slot.turf_id === 't_1' && slot.sport_id === 's_football')!;
    canonical.slot_status = 'available';
    old.turfs.push({ ...old.turfs[0], turf_id: 't_2', turf_name: 'Legacy venue' });
    old.turfImages.push({ image_id: 'legacy_photo', turf_id: 't_2', image_url: 'data:image/png;base64,photo', is_primary: true, uploaded_at: '2026-01-01' });
    old.slots.push({ ...canonical, slot_id: 'legacy_slot', turf_id: 't_2', slot_status: 'booked' });
    old.bookings.push({ ...old.bookings[0], booking_id: 'legacy_booking', slot_id: 'legacy_slot', slot_ids: ['legacy_slot'] });
    const userCount = old.users.length;

    const migrated = migrateSingleVenue(old);
    expect(migrated.turfs.map((turf) => turf.turf_name)).toEqual(['Manjalpur Sports']);
    expect(migrated.users).toHaveLength(userCount);
    expect(migrated.bookings.some((booking) => booking.booking_id === 'legacy_booking')).toBe(true);
    expect(migrated.slots.find((slot) => slot.slot_id === 'legacy_slot')).toBeDefined();
    expect(migrated.slots.find((slot) => slot.slot_id === canonical.slot_id)?.slot_status).toBe('booked');
    expect(migrated.turfImages.find((image) => image.image_id === 'legacy_photo')?.turf_id).toBe('t_1');
  });

  it('creates a team with the creator as captain', async () => {
    const team = await teamRepository.createTeam({
      created_by: 'u_noel', player_id: 'p_noel', sport_id: db.sports[0].sport_id,
      team_name: 'Test Strikers', description: 'Weekend games', required_players: 5,
    });
    expect(team.team_name).toBe('Test Strikers');
    expect(db.teamMembers.some((member) => member.team_id === team.team_id && member.member_role === 'captain' && member.user_id === 'u_noel')).toBe(true);
  });

  it('prevents a captain from requesting to join their own team', async () => {
    await expect(teamRepository.sendJoinRequest('team_1', 'p_noel', 'u_noel', 'Hi')).rejects.toThrow('already a member');
  });

  it('allows only the captain to accept requests and remove members', async () => {
    const request = await teamRepository.sendJoinRequest('team_1', 'p_3', 'u_p3', 'Join please');
    await expect(teamRepository.respondToRequest(request.request_id, true, 'u_p2')).rejects.toThrow('captain');
    await teamRepository.respondToRequest(request.request_id, true, 'u_noel');
    expect(db.teamMembers.some((member) => member.team_id === 'team_1' && member.user_id === 'u_p3' && member.membership_status === 'active')).toBe(true);
    await expect(teamRepository.removeMember('team_1', 'u_p3', 'u_p2')).rejects.toThrow('captain');
    await teamRepository.removeMember('team_1', 'u_p3', 'u_noel');
    expect(db.teamMembers.some((member) => member.team_id === 'team_1' && member.user_id === 'u_p3' && member.membership_status === 'active')).toBe(false);
  });

  it('lets the captain edit team details', async () => {
    await expect(teamRepository.updateTeam('team_1', 'u_p2', { team_name: 'New name' })).rejects.toThrow('captain');
    const team = await teamRepository.updateTeam('team_1', 'u_noel', { team_name: 'New name', description: 'Games every Friday', required_players: 12 });
    expect(team.team_name).toBe('New name');
    expect(team.description).toBe('Games every Friday');
    expect(team.required_players).toBe(12);
  });

  it('returns fresh slot snapshots after an admin blocks one', async () => {
    const slot = db.slots.find((item) => item.slot_status === 'available')!;
    const before = await turfRepository.getSlots(slot.turf_id, slot.slot_date, slot.sport_id);
    await turfRepository.blockSlot(slot.slot_id, true);
    const after = await turfRepository.getSlots(slot.turf_id, slot.slot_date, slot.sport_id);
    expect(before.find((item) => item.slot_id === slot.slot_id)?.slot_status).toBe('available');
    expect(after.find((item) => item.slot_id === slot.slot_id)?.slot_status).toBe('blocked');
  });

  it('restores missing demo slots across the next two weeks without replacing existing statuses', async () => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const nextWeek = format(addDays(new Date(), 10), 'yyyy-MM-dd');
    const existing = db.slots.find((slot) => slot.turf_id === 't_1' && slot.sport_id === 's_football' && slot.slot_date === tomorrow)!;
    existing.slot_status = 'blocked';
    db.slots = db.slots.filter((slot) => slot.slot_date !== nextWeek);

    const tomorrowSlots = await turfRepository.getSlots('t_1', tomorrow, 's_football');
    const nextWeekSlots = await turfRepository.getSlots('t_1', nextWeek, 's_football');
    expect(tomorrowSlots.find((slot) => slot.slot_id === existing.slot_id)?.slot_status).toBe('blocked');
    expect(nextWeekSlots.length).toBeGreaterThan(0);
    expect(nextWeekSlots.some((slot) => slot.slot_status === 'available')).toBe(true);
  });

  it('keeps venue and time data for completed and cancelled demo bookings', () => {
    for (const booking of db.bookings.filter((item) => item.booking_status === 'completed' || item.booking_status === 'cancelled')) {
      expect(db.slots.find((slot) => slot.slot_id === booking.slot_id), booking.booking_id).toBeDefined();
    }
  });
});
