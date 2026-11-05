import { db, persistDB } from './db';
import { delay, simulateLatency, withTimeout, randId } from '../../core/utils/withTimeout';
import { expireHolds } from './bookingRepository';
import type { Turf } from '../models/turf';
import type { TurfImage } from '../models/turfImage';
import type { TurfSlot } from '../models/turfSlot';
import { format, addDays } from 'date-fns';
import { seedSlots } from '../mock/seed';

export interface TurfWithExtras extends Turf {
  images: TurfImage[];
  sport_ids: string[];
  min_price: number;
}

export interface TurfQuery {
  sportId?: string;
  city?: string;
  query?: string;
  minRating?: number;
  maxPrice?: number;
  includeInactive?: boolean;
}

export interface CreateTurfInput {
  turf_name: string; description: string; address: string; city: string;
  opening_time: string; closing_time: string;
  sport_ids: string[]; image_urls: string[]; primary_image: string;
  turf_status?: Turf['turf_status'];
}

export interface TurfRepository {
  getTurfs(q?: TurfQuery): Promise<TurfWithExtras[]>;
  getTurf(id: string): Promise<TurfWithExtras | null>;
  getSlots(turfId: string, date: string, sportId?: string): Promise<TurfSlot[]>;
  createTurf(adminId: string, input: CreateTurfInput): Promise<Turf>;
  updateTurf(id: string, patch: Partial<CreateTurfInput & { turf_status?: Turf['turf_status'] }>): Promise<Turf>;
  deleteTurf(id: string): Promise<void>;
  blockSlot(slotId: string, blocked: boolean): Promise<TurfSlot>;
  generateSlots(input: { turfId: string; sportId: string; date: string; startHour: number; endHour: number; price: number }): Promise<number>;
}

function toTurfWithExtras(t: Turf): TurfWithExtras {
  const images = db.turfImages.filter((i) => i.turf_id === t.turf_id);
  const sport_ids = db.turfSports.filter((ts) => ts.turf_id === t.turf_id).map((ts) => ts.sport_id);
  const slots = db.slots.filter((s) => s.turf_id === t.turf_id && s.slot_status === 'available');
  const min_price = slots.length ? Math.min(...slots.map((s) => s.price)) : 800;
  return { ...t, images, sport_ids, min_price };
}

export const turfRepository: TurfRepository = {
  async getTurfs(q = {}) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      let list = q.includeInactive ? db.turfs : db.turfs.filter((t) => t.turf_status === 'active');
      if (q.city) list = list.filter((t) => t.city.toLowerCase().includes(q.city!.toLowerCase()));
      if (q.sportId) {
        const ids = new Set(db.turfSports.filter((ts) => ts.sport_id === q.sportId).map((ts) => ts.turf_id));
        list = list.filter((t) => ids.has(t.turf_id));
      }
      if (q.minRating) list = list.filter((t) => t.rating >= (q.minRating ?? 0));
      if (q.maxPrice) list = list.filter((t) => toTurfWithExtras(t).min_price <= (q.maxPrice ?? Infinity));
      if (q.query) {
        const needle = q.query.toLowerCase();
        list = list.filter(
          (t) => t.turf_name.toLowerCase().includes(needle)
            || t.address.toLowerCase().includes(needle)
            || t.city.toLowerCase().includes(needle),
        );
      }
      return list.map(toTurfWithExtras);
    })(), 8000, 'getTurfs');
  },

  async getTurf(id) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const t = db.turfs.find((x) => x.turf_id === id);
      return t ? toTurfWithExtras(t) : null;
    })(), 8000, 'getTurf');
  },

  async getSlots(turfId, date, sportId) {
    return withTimeout((async () => {
      expireHolds();
      await delay(simulateLatency());
      const existingIds = new Set(db.slots.map((slot) => slot.slot_id));
      const missing = seedSlots().filter((slot) => !existingIds.has(slot.slot_id) && db.turfs.some((turf) => turf.turf_id === slot.turf_id && turf.turf_status === 'active'));
      if (missing.length) { db.slots.push(...missing); persistDB(); }
      return db.slots
        .filter((s) => s.turf_id === turfId && s.slot_date === date && (!sportId || s.sport_id === sportId))
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((slot) => ({ ...slot }));
    })(), 8000, 'getSlots');
  },

  async createTurf(adminId, input) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      if (db.turfs.length > 0) throw new Error('SportsSync supports one venue for its owner');
      const turf: Turf = {
        turf_id: randId('t'),
        admin_id: adminId,
        turf_name: input.turf_name,
        description: input.description,
        opening_time: input.opening_time,
        closing_time: input.closing_time,
        turf_status: input.turf_status ?? 'active',
        address: input.address,
        city: input.city,
        rating: 4.0,
      };
      db.turfs.push(turf);
      input.sport_ids.forEach((sid) => db.turfSports.push({ turf_id: turf.turf_id, sport_id: sid }));
      input.image_urls.forEach((url) =>
        db.turfImages.push({
          image_id: randId('img'),
          turf_id: turf.turf_id,
          image_url: url,
          is_primary: url === input.primary_image,
          uploaded_at: new Date().toISOString().slice(0, 10),
        }));
      persistDB();
      return turf;
    })(), 8000, 'createTurf');
  },

  async updateTurf(id, patch) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const t = db.turfs.find((x) => x.turf_id === id);
      if (!t) throw new Error('Turf not found');
      const { sport_ids, image_urls, primary_image, ...rest } = patch as Partial<CreateTurfInput>;
      Object.assign(t, rest);
      if (sport_ids) {
        db.turfSports = db.turfSports.filter((ts) => ts.turf_id !== id);
        sport_ids.forEach((sid) => db.turfSports.push({ turf_id: id, sport_id: sid }));
      }
      if (image_urls) {
        db.turfImages = db.turfImages.filter((i) => i.turf_id !== id);
        image_urls.forEach((url) =>
          db.turfImages.push({
            image_id: randId('img'),
            turf_id: id,
            image_url: url,
            is_primary: url === primary_image,
            uploaded_at: new Date().toISOString().slice(0, 10),
          }));
      }
      persistDB();
      return t;
    })(), 8000, 'updateTurf');
  },

  async deleteTurf(id) {
    await withTimeout((async () => {
      await delay(simulateLatency());
      if (db.turfs.length <= 1) throw new Error('Cannot delete the only venue');
      db.turfs = db.turfs.filter((t) => t.turf_id !== id);
      db.turfImages = db.turfImages.filter((i) => i.turf_id !== id);
      db.turfSports = db.turfSports.filter((ts) => ts.turf_id !== id);
      db.slots = db.slots.filter((s) => s.turf_id !== id);
      persistDB();
    })(), 8000, 'deleteTurf');
  },

  async blockSlot(slotId, blocked) {
    return withTimeout((async () => {
      await delay(250);
      const s = db.slots.find((x) => x.slot_id === slotId);
      if (!s) throw new Error('Slot not found');
      s.slot_status = blocked ? 'blocked' : 'available';
      persistDB();
      return s;
    })(), 8000, 'blockSlot');
  },

  async generateSlots(input) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const { turfId, sportId, date, startHour, endHour, price } = input;
      if (startHour >= endHour) throw new Error('End hour must be after start hour');
      let count = 0;
      for (let h = startHour; h < endHour; h++) {
        const start = `${String(h).padStart(2, '0')}:00`;
        const end = `${String(h + 1).padStart(2, '0')}:00`;
        const exists = db.slots.some((s) => s.turf_id === turfId && s.sport_id === sportId && s.slot_date === date && s.start_time === start);
        if (exists) continue;
        db.slots.push({
          slot_id: randId('slot'),
          turf_id: turfId,
          sport_id: sportId,
          slot_date: date,
          start_time: start,
          end_time: end,
          price,
          slot_status: 'available',
        });
        count++;
      }
      persistDB();
      return count;
    })(), 8000, 'generateSlots');
  },
};

export const next7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'));

export const nextBookingDays = (): string[] =>
  Array.from({ length: 14 }, (_, i) => format(addDays(new Date(), i), 'yyyy-MM-dd'));
