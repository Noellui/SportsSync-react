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
});
