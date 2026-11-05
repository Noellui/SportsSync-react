import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { clsx } from 'clsx';
import { useTurfs, useTurfSlots } from '../../data/store/hooks';
import { turfRepository, next7Days } from '../../data/repositories/turfRepository';
import { formatTime, formatDateShort } from '../../core/utils/format';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';
import { Skeleton } from '../../core/components/Skeleton';
import { EmptyState } from '../../core/components/EmptyState';
import { BottomSheet } from '../../core/components/BottomSheet';

export function ManageSlotsPage() {
  const { data: turfs = [] } = useTurfs();
  const queryClient = useQueryClient();
  const [turfId, setTurfId] = useState<string | null>(turfs[0]?.turf_id ?? null);
  const selectedTurfId = turfId ?? turfs[0]?.turf_id ?? '';
  const [date, setDate] = useState(next7Days()[0]);
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({ sport_id: '', start_hour: 6, end_hour: 22, price: 800 });

  const { data: slots = [], isLoading, isError, error, refetch } = useTurfSlots(selectedTurfId, date);

  const days = next7Days();
  const turfSports = useMemo(() => {
    const t = turfs.find(x => x.turf_id === selectedTurfId);
    return t?.sport_ids ?? [];
  }, [turfs, selectedTurfId]);

  const stats = useMemo(() => ({
    total: slots.length,
    available: slots.filter(s => s.slot_status === 'available').length,
    booked: slots.filter(s => s.slot_status === 'booked').length,
    blocked: slots.filter(s => s.slot_status === 'blocked').length,
  }), [slots]);

  const generate = async () => {
    if (!selectedTurfId || !genForm.sport_id) return;
    try {
      const count = await turfRepository.generateSlots({
        turfId: selectedTurfId, sportId: genForm.sport_id, date, startHour: genForm.start_hour, endHour: genForm.end_hour, price: genForm.price
      });
      toast.success(count + ' slots generated');
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      setGenOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-[24px] font-bold text-text">Manage slots</h1>

      <div className="flex flex-wrap gap-3">
        <select value={selectedTurfId} onChange={e => { setTurfId(e.target.value); setDate(next7Days()[0]); }} className="flex-1 min-w-[200px] h-12 rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text">
          {turfs.map(t => <option key={t.turf_id} value={t.turf_id}>{t.turf_name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => setDate(d => { const i = days.indexOf(d); return days[(i - 1 + 7) % 7]; })} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-elevated"><ChevronLeft size={18} /></button>
          <span className="flex items-center px-4 font-semibold text-text">{formatDateShort(date)}</span>
          <button onClick={() => setDate(d => { const i = days.indexOf(d); return days[(i + 1) % 7]; })} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-elevated"><ChevronRight size={18} /></button>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setGenOpen(true)}>Generate slots</PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-text' },
          { label: 'Available', value: stats.available, color: 'text-success' },
          { label: 'Booked', value: stats.booked, color: 'text-danger' },
          { label: 'Blocked', value: stats.blocked, color: 'text-warning' },
        ].map(s => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-[12px] text-muted">{s.label}</p>
            <p className="mt-1 font-display text-[28px] font-bold" style={{color: s.color}}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">{Array.from({length:9}).map((_,i)=> <Skeleton key={i} className="h-16" />)}</div>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/30 p-4 text-danger">{error?.message ?? 'Could not load slots'} <button onClick={() => refetch()} className="ml-2 underline">Retry</button></div>
      ) : slots.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No slots for this day" message="Generate slots or pick another date." />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map(s => (
            <button
              key={s.slot_id}
              onClick={async () => {
                if (s.slot_status === 'booked') return;
                const next = s.slot_status === 'available' ? 'blocked' : 'available';
                try {
                  await turfRepository.blockSlot(s.slot_id, next === 'blocked');
                  await queryClient.invalidateQueries({ queryKey: ['slots'] });
                  toast.success(next === 'blocked' ? 'Slot blocked' : 'Slot available');
                } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update slot'); }
              }}
              className={clsx('flex h-16 flex-col items-center justify-center rounded-2xl border text-[12px] font-semibold transition-colors',
                s.slot_status === 'available' ? 'border-line bg-elevated/50 text-text' :
                s.slot_status === 'booked' ? 'border-line/50 bg-elevated/20 text-muted/50 line-through' :
                'border-warning/50 bg-warning/10 text-warning')}
            >
              <span>{formatTime(s.start_time)} \u2013 {formatTime(s.end_time)}</span>
              <span className={clsx('text-[11px]', s.slot_status === 'available' ? 'text-primary' : 'text-muted')}>
                {s.slot_status === 'available' ? 'Available \u00B7 ' + s.price : s.slot_status === 'booked' ? 'Booked' : 'Blocked'}
              </span>
            </button>
          ))}
        </div>
      )}

      <BottomSheet open={genOpen} onClose={() => setGenOpen(false)} title="Generate slots">
        <div className="space-y-4 pb-4">
          <select value={genForm.sport_id} onChange={e => setGenForm({...genForm, sport_id: e.target.value})} className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text">
            <option value="">Select sport</option>
            {turfSports.map(sid => <option key={sid} value={sid}>{sid.replace('s_', '')}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={genForm.start_hour} onChange={e => setGenForm({...genForm, start_hour: Number(e.target.value)})} min="0" max="23" placeholder="Start hour" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text" />
            <input type="number" value={genForm.end_hour} onChange={e => setGenForm({...genForm, end_hour: Number(e.target.value)})} min="1" max="24" placeholder="End hour" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text" />
          </div>
          <input type="number" value={genForm.price} onChange={e => setGenForm({...genForm, price: Number(e.target.value)})} min="100" placeholder="Price per slot" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text" />
          <PrimaryButton size="lg" full onClick={generate}>Generate</PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
