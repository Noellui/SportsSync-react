import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Home } from 'lucide-react';
import { useBooking } from '../../data/store/hooks';
import { inr, formatDateLong, formatTime } from '../../core/utils/format';
import { PrimaryButton } from '../../core/components/PrimaryButton';

export function PaymentSuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { data: booking } = useBooking(bookingId);

  const slot = booking?.slots[0];

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-5 pb-10 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative"
      >
        <span className="absolute -inset-6 rounded-full bg-primary/15 animate-pulse-ring" aria-hidden />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-gradient">
          <motion.svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden>
            <motion.path
              d="M4 12.5 L10 18.5 L20 6.5"
              stroke="#0B1210"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-6 font-display text-[28px] font-bold text-text"
      >
        {booking?.booking_status === 'pending' ? 'Share paid, slot held!' : 'Booking confirmed!'}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-1 text-[14px] text-muted"
      >
        {booking?.booking_status === 'pending' ? (booking.team_id ? 'Team members can pay their shares from My bookings within 10 minutes.' : 'Collect the remaining shares within 10 minutes to confirm.') : 'Your turf is locked in. See you on the pitch.'}
      </motion.p>

      {/* Ticket card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45, ease: 'easeOut' }}
        className="mt-7 w-full max-w-[380px] overflow-hidden rounded-[24px] border border-line bg-surface/80 backdrop-blur-sm"
      >
        <div className="p-5 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted">Booking ID</p>
              <p className="font-mono text-[13px] font-semibold text-text">{booking?.booking_id ?? bookingId}</p>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10.5px] font-bold uppercase text-success">
              {booking?.booking_status ?? 'confirmed'}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-[13.5px]">
            <div className="flex justify-between"><span className="text-muted">Turf</span><span className="font-semibold text-text">{booking?.turf_name ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Sport</span><span className="font-semibold text-text">{booking?.sport_name ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Date</span><span className="font-semibold text-text">{slot ? formatDateLong(slot.slot_date) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Time</span><span className="font-semibold text-text">{slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold text-text">{inr(booking?.booking_amount ?? 0)}</span></div>
            {booking && booking.player_count > 1 && (
              <div className="flex justify-between"><span className="text-muted">Split</span><span className="font-semibold text-primary">{inr(booking.per_player_amount)} × {booking.player_count} players</span></div>
            )}
          </div>
        </div>
        <div className="relative border-t border-dashed border-line bg-elevated/60 px-5 py-3">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg" aria-hidden />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-bg" aria-hidden />
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted">Transaction</span>
            <span className="font-mono font-semibold text-text">{booking?.payment?.transaction_no ?? '—'}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-7 flex w-full max-w-[380px] gap-3"
      >
        <PrimaryButton variant="ghost" icon={Home} className="flex-1" onClick={() => navigate('/home', { replace: true })}>
          Home
        </PrimaryButton>
        <PrimaryButton icon={CalendarCheck} className="flex-1" onClick={() => navigate('/home/bookings', { replace: true })}>
          My bookings
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
