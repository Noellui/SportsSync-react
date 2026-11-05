import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarCheck, X, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { useMyBookings, useCancelBooking, useCollectShare, usePayTeamShare } from '../../data/store/hooks';
import { useAuthStore } from '../../data/store/authStore';
import { inr, formatDateLong, formatTime, countdownLabel } from '../../core/utils/format';
import { SectionHeader } from '../../core/components/SectionHeader';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { EmptyState } from '../../core/components/EmptyState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { StatusChip, bookingTone } from '../../core/components/StatusChip';
import { BottomSheet } from '../../core/components/BottomSheet';
import { teamShareAmount, type BookingWithDetails } from '../../data/repositories/bookingRepository';
import type { PaymentMethod } from '../../data/models/payment';

type Tab = 'upcoming' | 'completed' | 'cancelled';
const tabs: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const cancelReasons = ['Rain forecast', 'Team conflict', 'Injury / medical', 'Change of plans', 'Too expensive'];

function BookingCard({ booking, userId, onOpen }: { booking: BookingWithDetails; userId?: string; onOpen: () => void }) {
  const slot = booking.slots[0];
  return (
    <button
      onClick={onOpen}
      className="flex w-full gap-3 rounded-[20px] border border-line bg-surface/70 p-3 text-left backdrop-blur-sm transition-transform hover:-translate-y-0.5"
    >
      {booking.turf_image && (
        <img src={booking.turf_image} alt="" className="h-[84px] w-[84px] shrink-0 rounded-2xl object-cover" />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-semibold text-text">{booking.turf_name}</p>
            <p className="text-[12px] text-muted">{booking.team_name ? `${booking.team_name} · ` : ''}{booking.sport_name}</p>
          </div>
          <StatusChip tone={bookingTone(booking.booking_status)}>{booking.booking_status}</StatusChip>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-[12px] text-muted">
            {slot ? `${countdownLabel(slot.slot_date, slot.start_time)}` : ''}
          </p>
          <div className="text-right">
            <p className="text-[13.5px] font-bold text-primary">{inr(booking.team_id && userId ? teamShareAmount(booking, userId) : booking.booking_amount)}</p>
            {booking.team_id && <p className="text-[11px] text-muted">Your share · {booking.paid_user_ids?.includes(userId ?? '') ? 'Paid' : 'Awaiting payment'}</p>}
            {booking.player_count > 1 && (
              <p className="text-[11px] text-muted">{inr(booking.per_player_amount)} × {booking.player_count} players</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function MyBookingsPage() {
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [openId, setOpenId] = useState<string | null>(new URLSearchParams(location.search).get('bookingId'));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(cancelReasons[0]);
  const [customReason, setCustomReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const player = useAuthStore((state) => state.player);

  const { data: bookings = [], isLoading, isError, refetch, error } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const collectShare = useCollectShare();
  const payTeamShare = usePayTeamShare();

  const filtered = bookings.filter((b) => {
    if (tab === 'upcoming') return b.booking_status === 'confirmed' || b.booking_status === 'pending';
    return b.booking_status === tab;
  });

  const open = bookings.find((b) => b.booking_id === openId);

  const doCancel = async () => {
    if (!open) return;
    try {
      await cancelBooking.mutateAsync({ bookingId: open.booking_id, reason: customReason.trim() || reason });
      toast.success('Booking cancelled. Payment refunded.');
      setCancelOpen(false);
      setOpenId(null);
      setCustomReason('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not cancel booking');
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <SectionHeader title="My bookings" />

      <div className="flex gap-1 rounded-2xl bg-surface/70 p-1" role="tablist" aria-label="Booking tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-colors min-h-10',
              tab === t.id ? 'bg-primary text-on-primary' : 'text-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-[20px]" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={`No ${tab} bookings`}
          message="Your booked games will show up here."
          action={
            tab !== 'completed' ? (
              <PrimaryButton onClick={() => navigate('/home/turfs')}>Book a turf</PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => <BookingCard key={b.booking_id} booking={b} userId={user?.user_id} onOpen={() => setOpenId(b.booking_id)} />)}
        </div>
      )}

      {/* Detail sheet */}
      <BottomSheet open={!!open} onClose={() => setOpenId(null)} title="Booking details">
        {open && (
          <div className="space-y-5 pb-4">
            <div className="flex items-center gap-3">
              {open.turf_image && <img src={open.turf_image} alt="" className="h-16 w-16 rounded-2xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[17px] font-semibold text-text">{open.turf_name}</p>
                <p className="text-[12.5px] text-muted">{open.team_name ? `${open.team_name} · ` : ''}{open.sport_name}</p>
              </div>
              <StatusChip tone={bookingTone(open.booking_status)}>{open.booking_status}</StatusChip>
            </div>

            <div className="space-y-2 rounded-2xl border border-line bg-elevated/40 p-4 text-[13.5px]">
              <div className="flex justify-between"><span className="text-muted">Date</span><span className="font-semibold text-text">{open.slots[0] ? formatDateLong(open.slots[0].slot_date) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Time</span><span className="font-semibold text-text">{open.slots[0] ? `${formatTime(open.slots[0].start_time)} – ${formatTime(open.slots[0].end_time)} (${open.slots.length} hr)` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold text-text">{inr(open.booking_amount)}</span></div>
              {open.player_count > 1 && (
                <div className="flex justify-between"><span className="text-muted">Split</span><span className="font-semibold text-primary">{inr(open.per_player_amount)} × {open.player_count} players</span></div>
              )}
              {open.player_count > 1 && <div className="flex justify-between"><span className="text-muted">Shares collected</span><span className="text-text">{open.shares_paid ?? (open.booking_status === 'confirmed' ? open.player_count : 1)} / {open.player_count}</span></div>}
              {open.team_id && user && <div className="flex justify-between"><span className="text-muted">Your share</span><span className="font-semibold text-primary">{inr(teamShareAmount(open, user.user_id))}</span></div>}
              {open.cancellation_reason && (
                <div className="flex justify-between gap-4"><span className="text-muted">Reason</span><span className="text-right text-danger">{open.cancellation_reason}</span></div>
              )}
            </div>

            {open.payment && (
              <div className="space-y-2 rounded-2xl border border-line bg-elevated/40 p-4 text-[13.5px]">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Payment</p>
                <div className="flex justify-between"><span className="text-muted">Method</span><span className="font-semibold capitalize text-text">{open.payment.payment_method}</span></div>
                <div className="flex justify-between"><span className="text-muted">Paid</span><span className="font-semibold text-text">{inr(open.payment.amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Transaction</span><span className="font-mono text-text">{open.payment.transaction_no}</span></div>
                <div className="flex justify-between"><span className="text-muted">Status</span><StatusChip tone={bookingTone(open.payment.payment_status)}>{open.payment.payment_status}</StatusChip></div>
              </div>
            )}

            {open.team_id && open.booking_status === 'pending' && user && !open.paid_user_ids?.includes(user.user_id) && (
              <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-[13px] text-text">Pay your share of {inr(teamShareAmount(open, user.user_id))} for this team booking.</p>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} aria-label="Payment method" className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-text">
                  <option value="upi">UPI</option><option value="card">Card</option><option value="wallet">Wallet</option><option value="cash">Pay at turf</option>
                </select>
                <PrimaryButton full loading={payTeamShare.isPending} onClick={async () => {
                  try { await payTeamShare.mutateAsync({ bookingId: open.booking_id, method: paymentMethod }); toast.success('Your share is paid'); }
                  catch (error) { toast.error(error instanceof Error ? error.message : 'Could not pay share'); }
                }}>Pay {inr(teamShareAmount(open, user.user_id))}</PrimaryButton>
              </div>
            )}

            {!open.team_id && (open.booking_status === 'pending' || (open.collection_mode === 'full' && (open.shares_paid ?? 1) < open.player_count)) && (
              <div className="space-y-2">
                <p className="text-[12px] text-muted">{open.hold_expires_at ? `Hold expires ${new Date(open.hold_expires_at).toLocaleTimeString()}. ` : ''}Mark a teammate's share as collected after receiving it.</p>
                <PrimaryButton full loading={collectShare.isPending} onClick={async () => {
                  try {
                    await collectShare.mutateAsync(open.booking_id);
                    toast.success('Share collected');
                  } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not collect share'); }
                }}>Mark next share collected</PrimaryButton>
              </div>
            )}

            {(open.booking_status === 'confirmed' || open.booking_status === 'pending') && (!open.team_id || open.player_id === player?.player_id) ? (
              <PrimaryButton
                variant="danger"
                icon={X}
                size="lg"
                full
                onClick={() => setCancelOpen(true)}
              >
                Cancel booking
              </PrimaryButton>
            ) : (
              <PrimaryButton variant="outline" size="lg" full icon={MapPin} onClick={() => { setOpenId(null); navigate('/home/turf/' + (open.slots[0]?.turf_id ?? '')); }}>
                View turf
              </PrimaryButton>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Cancel sheet */}
      <BottomSheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking?">
        <div className="space-y-4 pb-4">
          <p className="text-[13.5px] text-muted">Your payment will be refunded. Pick a reason:</p>
          <div className="space-y-2" role="radiogroup" aria-label="Cancellation reason">
            {cancelReasons.map((r) => (
              <label key={r} className={clsx(
                'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-[13.5px] min-h-11',
                reason === r && !customReason ? 'border-primary bg-primary/10 text-text' : 'border-line bg-elevated/40 text-muted',
              )}>
                <input
                  type="radio"
                  name="cancel-reason"
                  value={r}
                  checked={reason === r && !customReason}
                  onChange={() => { setReason(r); setCustomReason(''); }}
                  className="accent-primary"
                />
                {r}
              </label>
            ))}
          </div>
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Or write your own reason"
            rows={2}
            aria-label="Custom cancellation reason"
            className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[13.5px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
          />
          <div className="flex gap-3">
            <PrimaryButton variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>Keep it</PrimaryButton>
            <PrimaryButton
              variant="danger"
              className="flex-1"
              loading={cancelBooking.isPending}
              onClick={doCancel}
              disabled={customReason.trim().length === 0 && reason.length === 0}
            >
              Cancel booking
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
