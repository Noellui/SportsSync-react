import { useState, useMemo } from 'react';
import { CalendarDays, Search, Filter, X } from 'lucide-react';
import { useAllBookings } from '../../data/store/hooks';
import { inr, formatDateLong, formatTime } from '../../core/utils/format';
import { GlassCard } from '../../core/components/GlassCard';
import { StatusChip, bookingTone } from '../../core/components/StatusChip';
import { Skeleton } from '../../core/components/Skeleton';
import { EmptyState } from '../../core/components/EmptyState';
import { ErrorState } from '../../core/components/ErrorState';

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [query, setQuery] = useState('');

  const { data: bookings = [], isLoading, isError, refetch, error } = useAllBookings();

  const { today, weekAgo, monthAgo } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })();
    const monthAgo = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })();
    return { today, weekAgo, monthAgo };
  }, []);

  const filtered = useMemo(() => bookings.filter(b => {
    if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
    const sd = b.slots[0]?.slot_date;
    if (dateFilter === 'today' && sd !== today) return false;
    if (dateFilter === 'week' && (!sd || sd < weekAgo)) return false;
    if (dateFilter === 'month' && (!sd || sd < monthAgo)) return false;
    if (query) {
      const q = query.toLowerCase();
      const tn = (b.turf_name ?? '').toLowerCase();
      const sn = (b.sport_name ?? '').toLowerCase();
      if (!tn.includes(q) && !sn.includes(q)) return false;
    }
    return true;
  }), [bookings, statusFilter, dateFilter, query]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-[24px] font-bold text-text">All bookings</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search turf, sport" className="h-12 w-full rounded-2xl border border-line bg-elevated pl-11 pr-4 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="h-12 min-w-[150px] rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text">
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)} className="h-12 min-w-[150px] rounded-2xl border border-line bg-elevated px-4 text-[14px] text-text">
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
        {(statusFilter !== 'all' || dateFilter !== 'all' || query) && (
          <button onClick={() => { setStatusFilter('all'); setDateFilter('all'); setQuery(''); }} className="flex h-12 items-center gap-2 rounded-2xl border border-line bg-elevated px-4 text-[13px] font-semibold text-muted">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-[20px]" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No bookings match" message="Try adjusting your filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <GlassCard key={b.booking_id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center">
                    <CalendarDays size={18} className="text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-semibold text-text truncate">{b.turf_name ?? 'Turf'}</p>
                    <p className="text-[12px] text-muted">{b.sport_name} \u00B7 {b.slots[0] ? formatDateLong(b.slots[0].slot_date) : ''}</p>
                    <p className="text-[11.5px] text-muted">{b.slots[0] ? formatTime(b.slots[0].start_time) + ' \u2013 ' + formatTime(b.slots[0].end_time) : ''} \u00B7 {b.slots.length} hr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-[16px] font-bold text-text">{inr(b.booking_amount)}</p>
                    {b.player_count > 1 && <p className="text-[11px] text-primary">{inr(b.per_player_amount)} \u00D7 {b.player_count} players</p>}
                  </div>
                  <StatusChip tone={bookingTone(b.booking_status)}>{b.booking_status}</StatusChip>
                  {b.payment && (
                    <StatusChip tone={bookingTone(b.payment.payment_status)}>{b.payment.payment_status}</StatusChip>
                  )}
                </div>
              </div>
              {b.cancellation_reason && (
                <p className="mt-2 text-[12px] text-danger">Cancelled: {b.cancellation_reason}</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}