import { db, persistDB } from './db';
import { delay, simulateLatency, withTimeout, randId, randomTransactionNo } from '../../core/utils/withTimeout';
import type { Booking } from '../models/booking';
import type { Payment } from '../models/payment';
import type { TurfSlot } from '../models/turfSlot';
import type { PaymentMethod } from '../models/payment';
import { hasSlotStarted } from '../../core/utils/format';

export const CONVENIENCE_FEE = 30;
export const GST_RATE = 0.18;
export const SLOT_HOLD_MINUTES = 10;

export interface BookingWithDetails extends Booking {
  slots: TurfSlot[];
  payment?: Payment;
  turf_name?: string;
  turf_image?: string;
  sport_name?: string;
}

export interface CreateBookingInput {
  slot_ids: string[];
  player_id: string;
  player_count: number;
  payment_method: PaymentMethod;
  pay_mode: 'share' | 'full';
  discount?: number;
}

export function expireHolds() {
  for (const booking of db.bookings) {
    if (booking.booking_status === 'pending' && booking.hold_expires_at && Date.parse(booking.hold_expires_at) <= Date.now()) {
      bookingRepository.releaseHold(booking.booking_id);
    }
  }
}

function enrich(b: Booking): BookingWithDetails {
  const slots = db.slots.filter((s) => b.slot_ids.includes(s.slot_id));
  const slot = slots[0];
  const payment = db.payments.find((p) => p.booking_id === b.booking_id);
  const turf = db.turfs.find((t) => t.turf_id === slot?.turf_id);
  const sport = db.sports.find((s) => s.sport_id === slot?.sport_id);
  const img = db.turfImages.find((i) => i.turf_id === turf?.turf_id && i.is_primary)
    ?? db.turfImages.find((i) => i.turf_id === turf?.turf_id);
  return {
    ...b,
    slots,
    payment,
    turf_name: turf?.turf_name,
    turf_image: img?.image_url,
    sport_name: sport?.sport_name,
  };
}

export const bookingRepository = {
  async createBooking(input: CreateBookingInput): Promise<BookingWithDetails> {
    return withTimeout((async () => {
      await delay(simulateLatency() + 400);
      expireHolds();
      const { slot_ids, player_id, player_count, payment_method, pay_mode, discount = 0 } = input;
      if (!slot_ids.length) throw new Error('No slots selected');
      if (!Number.isInteger(player_count) || player_count < 1 || player_count > 22) throw new Error('Invalid player count');
      const slots = slot_ids.map((id) => db.slots.find((s) => s.slot_id === id));
      if (slots.some((s) => !s)) throw new Error('Slot not found');
      if (slots.some((s) => hasSlotStarted(s!.slot_date, s!.start_time))) throw new Error('Slot has already started');
      if (slots.some((s) => s!.slot_status !== 'available')) throw new Error('A selected slot is no longer available');

      const baseTotal = slots.reduce((sum, s) => sum + s!.price, 0);
      const gst = Math.round(CONVENIENCE_FEE * GST_RATE);
      if (!Number.isInteger(discount) || discount < 0 || discount > baseTotal + CONVENIENCE_FEE + gst) throw new Error('Invalid discount');
      const total = baseTotal + CONVENIENCE_FEE + gst - discount;
      const perPlayer = Math.ceil(total / player_count);
      const myShare = pay_mode === 'full' ? total : perPlayer;

      const booking: Booking = {
        booking_id: randId('b'),
        player_id,
        slot_id: slot_ids[0],
        slot_ids,
        booking_date: new Date().toISOString().slice(0, 10),
        booking_amount: total,
        booking_status: pay_mode === 'full' || player_count === 1 ? 'confirmed' : 'pending',
        cancellation_reason: null,
        player_count,
        per_player_amount: perPlayer,
        shares_paid: 1,
        collection_mode: pay_mode,
        hold_expires_at: pay_mode === 'share' && player_count > 1 ? new Date(Date.now() + SLOT_HOLD_MINUTES * 60_000).toISOString() : null,
      };
      const payment: Payment = {
        payment_id: randId('pay'),
        booking_id: booking.booking_id,
        amount: myShare,
        payment_method,
        payment_status: 'success',
        transaction_no: randomTransactionNo(),
        payment_date: new Date().toISOString().slice(0, 10),
      };
      slots.forEach((s) => { s!.slot_status = 'booked'; });
      db.bookings.push(booking);
      db.payments.push(payment);
      persistDB();
      if (booking.hold_expires_at && typeof window !== 'undefined') {
        window.setTimeout(() => bookingRepository.releaseHold(booking.booking_id), SLOT_HOLD_MINUTES * 60_000);
      }
      return enrich(booking);
    })(), 8000, 'createBooking');
  },

  async cancel(bookingId: string, reason: string): Promise<BookingWithDetails> {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const b = db.bookings.find((x) => x.booking_id === bookingId);
      if (!b) throw new Error('Booking not found');
      b.booking_status = 'cancelled';
      b.cancellation_reason = reason;
      b.slot_ids.forEach((sid) => {
        const s = db.slots.find((x) => x.slot_id === sid);
        if (s && s.slot_status === 'booked') s.slot_status = 'available';
      });
      const p = db.payments.find((x) => x.booking_id === bookingId);
      if (p && p.payment_status === 'success') p.payment_status = 'refunded';
      persistDB();
      return enrich(b);
    })(), 8000, 'cancelBooking');
  },

  async getMyBookings(playerId: string): Promise<BookingWithDetails[]> {
    return withTimeout((async () => {
      expireHolds();
      await delay(simulateLatency());
      return db.bookings
        .filter((b) => b.player_id === playerId)
        .map(enrich)
        .sort((a, b) => (b.slots[0]?.slot_date ?? '').localeCompare(a.slots[0]?.slot_date ?? ''));
    })(), 8000, 'getMyBookings');
  },

  async getAllBookings(): Promise<BookingWithDetails[]> {
    return withTimeout((async () => {
      expireHolds();
      await delay(simulateLatency());
      return db.bookings.map(enrich);
    })(), 8000, 'getAllBookings');
  },

  async getBooking(bookingId: string): Promise<BookingWithDetails | null> {
    return withTimeout((async () => {
      expireHolds();
      await delay(250);
      const b = db.bookings.find((x) => x.booking_id === bookingId);
      return b ? enrich(b) : null;
    })(), 8000, 'getBooking');
  },

  async collectShare(bookingId: string): Promise<BookingWithDetails> {
    return withTimeout((async () => {
      expireHolds();
      await delay(simulateLatency());
      const booking = db.bookings.find((b) => b.booking_id === bookingId);
      if (!booking || (booking.booking_status !== 'pending' && !(booking.collection_mode === 'full' && booking.booking_status === 'confirmed'))) throw new Error('Booking is no longer awaiting shares');
      if ((booking.shares_paid ?? 1) >= booking.player_count) throw new Error('All shares are already collected');
      booking.shares_paid = Math.min(booking.player_count, (booking.shares_paid ?? 1) + 1);
      if (booking.shares_paid === booking.player_count) {
        booking.booking_status = 'confirmed';
        booking.hold_expires_at = null;
      }
      persistDB();
      return enrich(booking);
    })(), 8000, 'collectShare');
  },

  releaseHold(bookingId: string) {
    const b = db.bookings.find((x) => x.booking_id === bookingId);
    if (!b || b.booking_status !== 'pending') return;
    b.booking_status = 'cancelled';
    b.cancellation_reason = 'Slot hold expired (10 min)';
    b.slot_ids.forEach((sid) => {
      const s = db.slots.find((x) => x.slot_id === sid);
      if (s) s.slot_status = 'available';
    });
    const p = db.payments.find((x) => x.booking_id === bookingId);
    if (p) p.payment_status = 'refunded';
    persistDB();
  },
};
