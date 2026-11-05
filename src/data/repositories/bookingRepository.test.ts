import { beforeEach, describe, expect, it } from 'vitest';
import { bookingRepository } from './bookingRepository';
import { db, resetDB } from './db';
import { hasSlotStarted } from '../../core/utils/format';

describe('booking payment lifecycle', () => {
  beforeEach(() => resetDB());

  const availableSlot = () => db.slots.find((slot) => slot.slot_status === 'available' && !hasSlotStarted(slot.slot_date, slot.start_time))!;

  it('charges the displayed discounted total and rounds shares up', async () => {
    const slot = availableSlot();
    const total = slot.price + 35;
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 3,
      payment_method: 'upi', pay_mode: 'share', discount: 100,
    });
    expect(booking.booking_amount).toBe(total - 100);
    expect(booking.per_player_amount).toBe(Math.ceil((total - 100) / 3));
    expect(booking.payment?.amount).toBe(booking.per_player_amount);
    expect(booking.booking_status).toBe('pending');
  });

  it('confirms after the remaining shares are collected', async () => {
    const slot = availableSlot();
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 3,
      payment_method: 'upi', pay_mode: 'share',
    });
    await bookingRepository.collectShare(booking.booking_id);
    const confirmed = await bookingRepository.collectShare(booking.booking_id);
    expect(confirmed.booking_status).toBe('confirmed');
    expect(confirmed.shares_paid).toBe(3);
  });

  it('releases an expired hold on the next repository read', async () => {
    const slot = availableSlot();
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 2,
      payment_method: 'upi', pay_mode: 'share',
    });
    db.bookings.find((b) => b.booking_id === booking.booking_id)!.hold_expires_at = new Date(0).toISOString();
    const current = await bookingRepository.getBooking(booking.booking_id);
    expect(current?.booking_status).toBe('cancelled');
    expect(slot.slot_status).toBe('available');
  });

  it('rejects a slot whose start time has passed', async () => {
    const slot = availableSlot();
    slot.slot_date = '2000-01-01';
    await expect(bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 1,
      payment_method: 'upi', pay_mode: 'full',
    })).rejects.toThrow('Slot has already started');
  });

  it('uses the active team members as the booking participants and lets each pay once', async () => {
    const slot = db.slots.find((item) => item.sport_id === 's_football' && item.slot_status === 'available' && !hasSlotStarted(item.slot_date, item.start_time))!;
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 1,
      team_id: 'team_1', payment_method: 'upi', pay_mode: 'share',
    });
    expect(booking.player_count).toBe(4);
    expect(booking.participant_user_ids).toEqual(['u_noel', 'u_p1', 'u_p5', 'u_p6']);
    expect(booking.paid_user_ids).toEqual(['u_noel']);
    expect((await bookingRepository.getMyBookings('p_1')).some((item) => item.booking_id === booking.booking_id)).toBe(true);

    await bookingRepository.payTeamShare(booking.booking_id, 'u_p1', 'card');
    expect((await bookingRepository.getMyBookings('p_1')).find((item) => item.booking_id === booking.booking_id)?.payment?.payment_method).toBe('card');
    await expect(bookingRepository.payTeamShare(booking.booking_id, 'u_p1', 'upi')).rejects.toThrow('already paid');
    await bookingRepository.payTeamShare(booking.booking_id, 'u_p5', 'upi');
    const confirmed = await bookingRepository.payTeamShare(booking.booking_id, 'u_p6', 'wallet');
    expect(confirmed.booking_status).toBe('confirmed');
    expect(confirmed.shares_paid).toBe(4);
    expect(db.payments.filter((payment) => payment.booking_id === booking.booking_id).reduce((sum, payment) => sum + payment.amount, 0)).toBeCloseTo(booking.booking_amount);
  });

  it('allows only the captain to book for a team sport', async () => {
    const football = db.slots.find((item) => item.sport_id === 's_football' && item.slot_status === 'available' && !hasSlotStarted(item.slot_date, item.start_time))!;
    await expect(bookingRepository.createBooking({
      slot_ids: [football.slot_id], player_id: 'p_1', player_count: 4,
      team_id: 'team_1', payment_method: 'upi', pay_mode: 'share',
    })).rejects.toThrow('captain');
    const cricket = db.slots.find((item) => item.sport_id === 's_cricket' && item.slot_status === 'available' && !hasSlotStarted(item.slot_date, item.start_time))!;
    await expect(bookingRepository.createBooking({
      slot_ids: [cricket.slot_id], player_id: 'p_noel', player_count: 4,
      team_id: 'team_1', payment_method: 'upi', pay_mode: 'share',
    })).rejects.toThrow('team sport');
  });

  it('splits a team total exactly to the paisa when it does not divide evenly', async () => {
    const slot = db.slots.find((item) => item.sport_id === 's_cricket' && item.slot_status === 'available' && !hasSlotStarted(item.slot_date, item.start_time))!;
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_1', player_count: 22,
      team_id: 'team_2', payment_method: 'upi', pay_mode: 'share',
    });
    expect(booking.player_count).toBe(3);
    await bookingRepository.payTeamShare(booking.booking_id, 'u_p3', 'card');
    await bookingRepository.payTeamShare(booking.booking_id, 'u_noel', 'wallet');
    const amounts = db.payments.filter((payment) => payment.booking_id === booking.booking_id).map((payment) => payment.amount);
    expect(Math.round(amounts.reduce((sum, amount) => sum + amount, 0) * 100)).toBe(booking.booking_amount * 100);
    expect(Math.round((Math.max(...amounts) - Math.min(...amounts)) * 100)).toBeLessThanOrEqual(1);
  });

  it('lets only the captain cancel and refunds every paid team share', async () => {
    const slot = db.slots.find((item) => item.sport_id === 's_football' && item.slot_status === 'available' && !hasSlotStarted(item.slot_date, item.start_time))!;
    const booking = await bookingRepository.createBooking({
      slot_ids: [slot.slot_id], player_id: 'p_noel', player_count: 4,
      team_id: 'team_1', payment_method: 'upi', pay_mode: 'share',
    });
    await bookingRepository.payTeamShare(booking.booking_id, 'u_p1', 'card');
    await expect(bookingRepository.cancel(booking.booking_id, 'Changed plans', 'u_p1')).rejects.toThrow('captain');
    await bookingRepository.cancel(booking.booking_id, 'Changed plans', 'u_noel');
    expect(db.payments.filter((payment) => payment.booking_id === booking.booking_id).every((payment) => payment.payment_status === 'refunded')).toBe(true);
    expect(slot.slot_status).toBe('available');
  });
});
