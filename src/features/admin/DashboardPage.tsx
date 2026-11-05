import { TrendingUp, DollarSign, Building2, CalendarCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useAllBookings, useTurfs } from '../../data/store/hooks';
import { useAuthStore } from '../../data/store/authStore';
import { inr } from '../../core/utils/format';
import { GlassCard } from '../../core/components/GlassCard';
import { StatusChip, bookingTone } from '../../core/components/StatusChip';

function StatCard({ icon: Icon, label, value, change, color }: { icon: typeof TrendingUp; label: string; value: string | number; change?: string; color: string }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-semibold text-muted">{label}</p>
          <p className="mt-1 font-display text-[28px] font-bold text-text">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} aria-hidden />
        </div>
      </div>
      {change && <p className="mt-3 text-[12px] font-medium text-success">{change}</p>}
    </GlassCard>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: bookings = [] } = useAllBookings();
  const { data: turfs = [] } = useTurfs();

  const { today, weekAgo, weekStart } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekAgo = weekStart.toISOString().slice(0, 10);
    return { today, weekAgo, weekStart };
  }, []);

  const todaysBookings = bookings.filter((b) => b.slots[0]?.slot_date === today && b.booking_status === 'confirmed').length;
  const weeklyRevenue = bookings
    .filter((b) => b.slots[0]?.slot_date >= weekAgo && b.booking_status === 'confirmed')
    .reduce((sum, b) => sum + b.booking_amount, 0);
  const activeTurfs = turfs.filter((t) => t.turf_status === 'active').length;
  const totalSlots = turfs.reduce((sum, t) => sum + (t.sport_ids.length * 17 * 7), 0);
  const bookedSlots = bookings.filter((b) => b.booking_status === 'confirmed').reduce((sum, b) => sum + b.slot_ids.length, 0);
  const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = days.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dayBookings = bookings.filter((b) => b.slots[0]?.slot_date === d.toISOString().slice(0, 10) && b.booking_status === 'confirmed');
    return dayBookings.reduce((s, b) => s + b.booking_amount, 0);
  });
  const maxRev = Math.max(...weekData, 1);

  const recent = bookings
    .filter((b) => b.booking_status === 'confirmed')
    .sort((a, b) => (b.slots[0]?.slot_date ?? '').localeCompare(a.slots[0]?.slot_date ?? ''))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[28px] font-bold text-text">Welcome back, {user?.full_name.split(' ')[0] ?? 'Admin'} 👋</h1>
        <p className="mt-0.5 text-[14px] text-muted">Here's how your turfs are performing.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today's bookings" value={todaysBookings} change="+12% vs yesterday" color="#B6FF3B" />
        <StatCard icon={DollarSign} label="Revenue this week" value={inr(weeklyRevenue)} change="+8% vs last week" color="#2EE6A6" />
        <StatCard icon={Building2} label="Active turfs" value={activeTurfs} change={turfs.length > activeTurfs ? `${turfs.length - activeTurfs} inactive` : undefined} color="#3DDC84" />
        <StatCard icon={CalendarCheck} label="Occupancy" value={`${occupancy}%`} color="#FFB84D" />
      </div>

      {/* Weekly revenue bar chart (hand-drawn SVG) */}
      <GlassCard className="p-5">
        <p className="mb-4 font-display text-[17px] font-semibold text-text">Revenue (last 7 days)</p>
        <div className="h-48 flex items-end justify-around gap-1 px-2">
          {weekData.map((rev, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-full max-w-[56px]">
              <div className="w-full" style={{ height: `${(rev / maxRev) * 280}px` }}>
                <div className="h-full w-full rounded-t-[6px] bg-primary-gradient relative" style={{ boxShadow: '0 -4px 20px -4px rgba(182,255,59,0.4)' }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-text whitespace-nowrap">{inr(rev)}</span>
                </div>
              </div>
              <span className="text-[11px] text-muted">{days[i]}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent bookings */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-[17px] font-semibold text-text">Recent bookings</p>
        </div>
        {recent.length === 0 ? (
          <p className="text-[13.5px] text-muted text-center py-4">No recent bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((b) => (
              <div key={b.booking_id} className="flex items-center justify-between rounded-xl border border-line bg-elevated/50 px-4 py-3 text-[13.5px]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center">
                    <DollarSign size={16} className="text-primary" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-text truncate">{b.turf_name ?? 'Turf'}</p>
                    <p className="text-[11.5px] text-muted">{b.sport_name} · {b.slots[0]?.slot_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-[15px] font-bold text-text">{inr(b.booking_amount)}</p>
                  <StatusChip tone={bookingTone(b.booking_status)}>{b.booking_status}</StatusChip>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
