import { format, differenceInDays, parseISO } from 'date-fns';

export const inr = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

export const formatDateShort = (isoDate: string) =>
  format(parseISO(isoDate), 'EEE, d MMM');

export const formatDateLong = (isoDate: string) =>
  format(parseISO(isoDate), 'EEEE, d MMMM yyyy');

export function hasSlotStarted(date: string, startTime: string, now = Date.now()): boolean {
  return Date.parse(`${date}T${startTime}:00+05:30`) <= now;
}

export function daysUntil(isoDate: string): number {
  return differenceInDays(parseISO(isoDate), new Date());
}

export function countdownLabel(isoDate: string, time = ''): string {
  const d = daysUntil(isoDate);
  const when = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`;
  if (!time) return when;
  return `${when} at ${formatTime(time)}`;
}

export function isOpenNow(opening: string, closing: string, now = new Date()): boolean {
  const [oh, om] = opening.split(':').map(Number);
  const [ch, cm] = closing.split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}
