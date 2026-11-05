import { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Heart, MapPin, Star,
  Car, Droplets, Lightbulb, Bath, DoorOpen, CalendarDays,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTurf, useTurfSlots, useSports } from '../../data/store/hooks';
import { next7Days } from '../../data/repositories/turfRepository';
import { inr, formatTime, formatDateShort, isOpenNow, hasSlotStarted } from '../../core/utils/format';
import { StatusChip } from '../../core/components/StatusChip';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { BottomSheet } from '../../core/components/BottomSheet';
import type { TurfSlot } from '../../data/models/turfSlot';

const amenities = [
  { icon: Car, label: 'Parking' },
  { icon: Bath, label: 'Washroom' },
  { icon: Lightbulb, label: 'Floodlights' },
  { icon: Droplets, label: 'Water' },
  { icon: DoorOpen, label: 'Changing room' },
];

function SlotPicker({ turfId, sports, onDone }: {
  turfId: string;
  sports: { sport_id: string; sport_name: string }[];
  onDone: (slotIds: string[]) => void;
}) {
  const days = useMemo(() => next7Days(), []);
  const [date, setDate] = useState(days[0]);
  const [sportId, setSportId] = useState(sports[0]?.sport_id ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const { data: slots = [], isLoading } = useTurfSlots(turfId, date, sportId);

  const toggle = (slot: TurfSlot) => {
    if (slot.slot_status !== 'available' || hasSlotStarted(slot.slot_date, slot.start_time)) return;
    try { navigator.vibrate?.(10); } catch { /* noop */ }
    setSelected((prev) => {
      if (prev.includes(slot.slot_id)) return prev.filter((s) => s !== slot.slot_id);
      // enforce consecutiveness
      const next = [...prev, slot.slot_id];
      next.sort((a, b) => {
        const sa = slots.find((x) => x.slot_id === a);
        const sb = slots.find((x) => x.slot_id === b);
        return (sa?.start_time ?? '').localeCompare(sb?.start_time ?? '');
      });
      const times = next.map((id) => slots.find((s) => s.slot_id === id)?.start_time ?? '');
      for (let i = 1; i < times.length; i++) {
        const a = parseInt(times[i - 1].slice(0, 2), 10);
        const b = parseInt(times[i].slice(0, 2), 10);
        if (b !== a + 1) return prev.filter((s) => s !== slot.slot_id); // not consecutive, ignore
      }
      return next;
    });
  };

  const total = selected.reduce((sum, id) => sum + (slots.find((s) => s.slot_id === id)?.price ?? 0), 0);

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Date strip */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-1">
        {days.map((d) => {
          const sel = d === date;
          return (
            <button
              key={d}
              onClick={() => { setDate(d); setSelected([]); }}
              className={clsx(
                'flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border text-[12px] font-semibold transition-colors',
                sel ? 'border-primary bg-primary text-on-primary' : 'border-line bg-elevated/50 text-muted',
              )}
            >
              <span className="text-[10px] uppercase opacity-80">{formatDateShort(d).slice(0, 3)}</span>
              <span className="text-[18px] font-bold">{d.slice(8)}</span>
            </button>
          );
        })}
      </div>

      {/* Sport chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {sports.map((s) => (
          <button
            key={s.sport_id}
            onClick={() => { setSportId(s.sport_id); setSelected([]); }}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
              sportId === s.sport_id ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
            )}
          >
            {s.sport_name}
          </button>
        ))}
      </div>

      {/* Slot grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {slots.map((s) => {
            const isSel = selected.includes(s.slot_id);
            const booked = s.slot_status === 'booked';
            const blocked = s.slot_status === 'blocked';
            const started = hasSlotStarted(s.slot_date, s.start_time);
            return (
              <button
                key={s.slot_id}
                disabled={booked || blocked || started}
                onClick={() => toggle(s)}
                aria-pressed={isSel}
                className={clsx(
                  'flex h-16 flex-col items-center justify-center rounded-2xl border text-[11.5px] font-semibold transition-all',
                  isSel && 'border-primary bg-primary text-on-primary',
                  !isSel && !booked && !blocked && !started && 'border-line bg-elevated/40 text-text hover:border-primary/50',
                  booked && 'border-line/50 bg-elevated/20 text-muted/50 line-through',
                  blocked && 'border-line/50 bg-elevated/20 text-muted/50',
                  started && 'border-line/50 bg-elevated/20 text-muted/50',
                )}
              >
                <span>{formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
                <span className={clsx('mt-0.5 text-[11px]', isSel ? 'text-on-primary/80' : 'text-primary', booked && 'text-muted/50', blocked && 'text-muted/50')}>
                  {booked ? 'Booked' : blocked ? 'Locked' : started ? 'Started' : inr(s.price)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-line bg-elevated/40" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-elevated/30 opacity-50" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-elevated/30 opacity-50" /> Blocked</span>
      </div>

      <div className="sticky bottom-0 border-t border-line bg-elevated px-5 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11.5px] text-muted">Total</p>
            <p className="font-display text-[20px] font-bold text-text">{inr(total)}</p>
          </div>
          <PrimaryButton
            size="lg"
            disabled={selected.length === 0}
            onClick={() => onDone(selected)}
            className="min-w-[180px]"
          >
            Continue to pay
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function TurfDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const { data: turf, isLoading, isError, refetch, error } = useTurf(id);
  const { data: allSports = [] } = useSports();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-80 w-full rounded-[20px]" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }
  if (isError || !turf) {
    return <ErrorState message={error?.message ?? 'Turf not found'} onRetry={() => refetch()} />;
  }

  const images = turf.images.length ? turf.images : [];
  const openNow = isOpenNow(turf.opening_time, turf.closing_time);
  const turfSports = allSports.filter((s) => turf.sport_ids.includes(s.sport_id));

  const onSlotsPicked = (slotIds: string[]) => {
    setPickerOpen(false);
    navigate(`/home/checkout/${slotIds[0]}${location.search}`, { state: { slotIds } });
  };

  return (
    <div className="pb-28">
      {/* Hero carousel */}
      <div className="relative">
        <div
          className="no-scrollbar flex h-80 snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setImgIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <img
              key={img.image_id}
              src={img.image_url}
              alt={`${turf.turf_name} photo ${i + 1}`}
              className="h-full w-full shrink-0 object-cover snap-center"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" aria-hidden />
        <div className="absolute left-4 top-4 flex gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-bg/50 backdrop-blur-md"
          >
            <ArrowLeft size={18} className="text-text" aria-hidden />
          </button>
          <button
            aria-label="Add to favorites"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-bg/50 backdrop-blur-md"
          >
            <Heart size={18} className="text-text" aria-hidden />
          </button>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((img, i) => (
              <span key={img.image_id} className={clsx('h-1.5 rounded-full transition-all', i === imgIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/40')} />
            ))}
          </div>
        )}
      </div>

      {/* Content sheet (overlaps hero via translate, no negative margins) */}
      <div className="relative rounded-t-[32px] bg-bg px-5 pb-6 pt-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-bold leading-tight text-text">{turf.turf_name}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex items-center gap-1 text-[13px] font-semibold text-text">
                <Star size={13} className="fill-primary text-primary" aria-hidden />
                {turf.rating.toFixed(1)}
              </span>
              <span className="text-[12.5px] text-muted">({Math.round(turf.rating * 26)} reviews)</span>
            </div>
          </div>
          <StatusChip tone={openNow ? 'success' : 'danger'}>
            {openNow ? 'Open now' : 'Closed'}
          </StatusChip>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
          <MapPin size={13} aria-hidden />
          {turf.address}
        </p>

        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          {showMore ? turf.description : turf.description.slice(0, 120) + '…'}{' '}
          <button
            onClick={() => setShowMore((v) => !v)}
            className="font-semibold text-primary min-h-9 px-1"
          >
            {showMore ? 'Read less' : 'Read more'}
          </button>
        </p>

        <div className="mt-5">
          <h3 className="mb-2 font-display text-[16px] font-semibold text-text">Sports offered</h3>
          <div className="flex flex-wrap gap-2">
            {turfSports.map((s) => (
              <span key={s.sport_id} className="rounded-full bg-primary/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-primary">
                {s.sport_name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 font-display text-[16px] font-semibold text-text">Amenities</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {amenities.map((a) => (
              <div key={a.label} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface/60 px-3.5 py-3">
                <a.icon size={17} className="text-primary" aria-hidden />
                <span className="text-[13px] font-medium text-text">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-surface/60 px-4 py-3 text-[12.5px] text-muted">
          <CalendarDays size={15} className="text-primary" aria-hidden />
          Open {formatTime(turf.opening_time)} – {formatTime(turf.closing_time)}
        </div>
      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-surface/90 p-3 backdrop-blur-[14px] md:left-auto md:right-8 md:w-[420px]">
        <div>
          <p className="text-[11px] text-muted">From</p>
          <p className="font-display text-[18px] font-bold text-primary">{inr(turf.min_price)} <span className="text-[12px] font-medium text-muted">/ hr</span></p>
        </div>
        <PrimaryButton size="lg" onClick={() => setPickerOpen(true)} className="min-w-[160px]">
          Book a slot
        </PrimaryButton>
      </div>

      <BottomSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pick your slots"
      >
        <SlotPicker
          turfId={turf.turf_id}
          sports={turfSports.map((s) => ({ sport_id: s.sport_id, sport_name: s.sport_name }))}
          onDone={onSlotsPicked}
        />
      </BottomSheet>
    </div>
  );
}
