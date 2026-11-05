import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Smartphone, CreditCard, Wallet, Banknote,
  Users, Minus, Plus, Tag,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../data/store/authStore';
import { useTurfSlots, useTurf, useCreateBooking, useTeams } from '../../data/store/hooks';
import { db } from '../../data/repositories/db';
import { CONVENIENCE_FEE, GST_RATE, teamShareAmount } from '../../data/repositories/bookingRepository';
import { inr, formatDateLong, formatTime } from '../../core/utils/format';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';
import type { PaymentMethod } from '../../data/models/payment';

const methods: { id: PaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'cash', label: 'Pay at turf', icon: Banknote },
];

export function CheckoutPage() {
  const { slotId } = useParams<{ slotId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as { slotIds?: string[] };
  const slotIds = state.slotIds?.length ? state.slotIds : [slotId ?? ''];

  const { user, player } = useAuthStore();
  const firstSlot = db.slots.find((s) => s.slot_id === slotIds[0]);
  const { data: turf } = useTurf(firstSlot?.turf_id);
  const { data: slots = [], isLoading: slotsLoading, isError: slotsError, refetch: retrySlots } = useTurfSlots(firstSlot?.turf_id, firstSlot?.slot_date ?? '', firstSlot?.sport_id);
  const { data: myTeams = [], isLoading: teamsLoading } = useTeams();

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const requestedPlayers = Number(new URLSearchParams(location.search).get('players'));
  const requestedTeamId = new URLSearchParams(location.search).get('teamId') ?? '';
  const [manualPlayerCount, setManualPlayerCount] = useState(Number.isInteger(requestedPlayers) && requestedPlayers >= 1 && requestedPlayers <= 22 ? requestedPlayers : 1);
  const [manualPayMode, setManualPayMode] = useState<'share' | 'full'>('share');
  const [teamId, setTeamId] = useState(requestedTeamId);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const createBooking = useCreateBooking();
  const captainTeams = myTeams.filter((team) => team.captain_user_id === user?.user_id && team.sport_id === firstSlot?.sport_id);
  const selectedTeam = captainTeams.find((team) => team.team_id === teamId);
  const playerCount = selectedTeam?.member_count ?? manualPlayerCount;
  const payMode = selectedTeam ? 'share' : manualPayMode;

  const selectedSlots = slots.filter((s) => slotIds.includes(s.slot_id));
  const baseTotal = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(CONVENIENCE_FEE * GST_RATE);
  const promoDiscount = promoApplied ? Math.round((baseTotal + CONVENIENCE_FEE + gst) * 0.2) : 0;
  const total = baseTotal + CONVENIENCE_FEE + gst - promoDiscount;
  const perPlayer = selectedTeam ? Math.ceil(total * 100 / playerCount) / 100 : Math.ceil(total / playerCount);
  const rounding = selectedTeam ? 0 : perPlayer * playerCount - total;
  const myShare = payMode === 'full' ? total : selectedTeam && user ? teamShareAmount({ booking_amount: total, participant_user_ids: selectedTeam.members.map((member) => member.user_id) }, user.user_id) : perPlayer;

  const teamMembers = selectedTeam?.members.map((m) => {
      const u = db.users.find((x) => x.user_id === m.user_id);
      return { name: u?.full_name ?? 'Player', userId: m.user_id, captain: m.member_role === 'captain' };
    }) ?? [];

  const sportName = db.sports.find((s) => s.sport_id === firstSlot?.sport_id)?.sport_name ?? '';

  const pay = async () => {
    if (!firstSlot || !player || selectedSlots.length !== slotIds.length || (teamId && !selectedTeam)) return;
    setProcessing(true);
    try {
      const booking = await createBooking.mutateAsync({
        slot_ids: slotIds,
        player_id: player.player_id,
        player_count: playerCount,
        team_id: selectedTeam?.team_id,
        payment_method: method,
        pay_mode: payMode,
        discount: promoDiscount,
      });
      navigate(`/home/payment-success/${booking.booking_id}`, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const endHour = firstSlot ? parseInt(firstSlot.end_time.slice(0, 2), 10) + (slotIds.length - 1) : 1;

  return (
    <div className="space-y-5 pb-52 md:pb-32">
      {slotsError && <div role="alert" className="rounded-2xl border border-danger/30 p-4 text-danger">Could not load the selected slots. <button onClick={() => retrySlots()} className="underline">Retry</button></div>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70"
        >
          <ArrowLeft size={18} className="text-text" aria-hidden />
        </button>
        <h1 className="font-display text-[24px] font-bold text-text">Checkout</h1>
      </div>

      {/* Summary */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-3">
          {turf?.images[0] && (
            <img src={turf.images[0].image_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[16px] font-semibold text-text">{turf?.turf_name ?? 'Turf'}</p>
            <p className="text-[12.5px] text-muted">{sportName} · {firstSlot ? formatDateLong(firstSlot.slot_date) : ''}</p>
            <p className="text-[12.5px] text-muted">
              {formatTime(firstSlot?.start_time ?? '')} – {formatTime(`${String(endHour).padStart(2, '0')}:00`)} · {slotIds.length} hr
            </p>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-line pt-3 text-[13.5px]">
          <div className="flex justify-between text-muted"><span>Slots ({slotIds.length} hr)</span><span>{inr(baseTotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Convenience fee</span><span>{inr(CONVENIENCE_FEE)}</span></div>
          <div className="flex justify-between text-muted"><span>GST (18% on fee)</span><span>{inr(gst)}</span></div>
          {promoApplied && (
            <div className="flex justify-between text-success"><span>Promo (20% off)</span><span>−{inr(promoDiscount)}</span></div>
          )}
          <div className="flex justify-between border-t border-line pt-2 text-[15px] font-bold text-text">
            <span>Total</span><span>{inr(total)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Players + split */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-text">
            <Users size={16} className="text-primary" aria-hidden /> Players
          </p>
          <div className="flex items-center gap-3">
            {!selectedTeam ? <>
            <button
              onClick={() => setManualPlayerCount((c) => Math.max(1, c - 1))}
              aria-label="Fewer players"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-elevated"
            >
              <Minus size={15} className="text-text" aria-hidden />
            </button>
            <span className="w-6 text-center font-display text-[17px] font-bold text-text" aria-live="polite">{playerCount}</span>
            <button
              onClick={() => setManualPlayerCount((c) => Math.min(22, c + 1))}
              aria-label="More players"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-elevated"
            >
              <Plus size={15} className="text-text" aria-hidden />
            </button>
            </> : <span className="text-[13px] font-semibold text-primary">{playerCount} active members</span>}
          </div>
        </div>

        <label className="block text-[12.5px] font-semibold text-muted" htmlFor="booking-team">Book with a team
          <select
            id="booking-team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-line bg-elevated px-3.5 text-[13.5px] text-text focus:outline-none focus:ring-[1.5px] focus:ring-primary"
          >
            <option value="">No team — individual booking</option>
            {captainTeams.map((t) => (
              <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.member_count} players)</option>
            ))}
          </select>
          {!teamsLoading && captainTeams.length === 0 && <span className="mt-1 block font-normal text-muted">No teams you captain play {sportName}.</span>}
        </label>
        {teamId && !teamsLoading && !selectedTeam && <p role="alert" className="text-[12px] text-danger">This team cannot book the selected sport. Go back and choose a matching turf.</p>}

        {playerCount > 1 && (
          <div className="space-y-2.5">
            {/* Segmented toggle */}
            {!selectedTeam && <div className="grid grid-cols-2 gap-1 rounded-2xl bg-elevated p-1" role="radiogroup" aria-label="Payment mode">
              {(['share', 'full'] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={payMode === m}
                  onClick={() => setManualPayMode(m)}
                  className={clsx(
                    'rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-colors min-h-10',
                    payMode === m ? 'bg-primary text-on-primary' : 'text-muted',
                  )}
                >
                  {m === 'share' ? 'Pay my share' : 'Pay full & collect'}
                </button>
              ))}
            </div>}

            {/* Split summary */}
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-text">{inr(total)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Players</span>
                <span className="font-semibold text-text">{playerCount}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-primary/20 pt-2">
                <span className="text-[13.5px] font-semibold text-text">Each pays</span>
                <span className="font-display text-[18px] font-bold text-primary">{inr(perPlayer)}</span>
              </div>
              {rounding > 0 && (
                <p className="mt-1.5 text-[11px] text-muted">
                  {inr(rounding)} covered by the booker (rounding up).
                </p>
              )}
              <p className="mt-2 text-[12px] font-semibold text-success">
                {payMode === 'share' ? `You pay ${inr(myShare)} now` : `You pay ${inr(total)} now`}
                {payMode === 'share' && ' · slot held 10 min for teammates'}
              </p>
            </div>

            {/* Player list */}
            <ul className="space-y-1.5">
              {teamMembers.length > 0 ? (
                teamMembers.slice(0, 6).map((m) => (
                  <li key={m.userId} className="flex items-center justify-between text-[13px]">
                    <span className="text-muted">{m.name} {m.captain && <span className="text-primary text-[10px] font-bold">(captain)</span>}</span>
                    <span className={clsx('rounded-full px-2 py-0.5 text-[10.5px] font-bold', m.userId === user?.user_id ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>
                      {m.userId === user?.user_id ? 'Paying now' : 'Pending'} · {inr(teamShareAmount({ booking_amount: total, participant_user_ids: teamMembers.map((member) => member.userId) }, m.userId))}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center justify-between text-[13px]">
                    <span className="text-muted">{user?.full_name} (you)</span>
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10.5px] font-bold text-success">Paid · {inr(payMode === 'full' ? total : perPlayer)}</span>
                  </li>
                  {Array.from({ length: Math.min(playerCount - 1, 3) }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between text-[13px]">
                      <span className="text-muted">Player {i + 2}</span>
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10.5px] font-bold text-warning">Pending · {inr(perPlayer)}</span>
                    </li>
                  ))}
                  {playerCount > 4 && <li className="text-[11.5px] text-muted">+{playerCount - 4} more</li>}
                </>
              )}
            </ul>
          </div>
        )}
      </GlassCard>

      {/* Promo */}
      <GlassCard className="flex items-center gap-3">
        <Tag size={17} className="shrink-0 text-primary" aria-hidden />
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value.toUpperCase())}
          placeholder="Promo code (try FIRSTPLAY20)"
          aria-label="Promo code"
          className="h-11 min-w-0 flex-1 bg-transparent text-[13.5px] text-text placeholder:text-muted/60 focus:outline-none"
        />
        <button
          onClick={() => {
            if (promo.trim().toUpperCase() === 'FIRSTPLAY20') { setPromoApplied(true); toast.success('20% off applied!'); }
            else toast.error('Invalid promo code');
          }}
          className="shrink-0 rounded-xl border border-line px-4 py-2 text-[12.5px] font-semibold text-text min-h-10"
        >
          Apply
        </button>
      </GlassCard>

      {/* Payment method */}
      <div>
        <h3 className="mb-2.5 font-display text-[16px] font-semibold text-text">Payment method</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              aria-pressed={method === m.id}
              className={clsx(
                'flex items-center gap-2.5 rounded-2xl border px-3.5 py-3.5 text-left transition-colors',
                method === m.id ? 'border-primary bg-primary/10' : 'border-line bg-surface/60',
              )}
            >
              <m.icon size={18} className={method === m.id ? 'text-primary' : 'text-muted'} aria-hidden />
              <span className={clsx('text-[13.5px] font-semibold', method === m.id ? 'text-text' : 'text-muted')}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky pay bar */}
      <div className="fixed bottom-28 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-surface/90 p-3 backdrop-blur-[14px] md:bottom-4 md:left-auto md:right-8 md:w-[420px]">
        <div>
          <p className="text-[11px] text-muted">You pay</p>
          <p className="font-display text-[19px] font-bold text-primary">{inr(myShare)}</p>
        </div>
        <PrimaryButton size="lg" disabled={slotsLoading || slotsError || teamsLoading || (teamId !== '' && !selectedTeam) || selectedSlots.length !== slotIds.length} loading={createBooking.isPending} onClick={pay} className="min-w-[170px]">
          Pay {inr(myShare)}
        </PrimaryButton>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg/95 backdrop-blur-md"
          >
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" aria-hidden />
              <span className="absolute inset-2 rounded-full border border-primary/50" aria-hidden />
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient">
                <Users size={22} className="text-on-primary" aria-hidden />
              </span>
            </div>
            <p className="font-display text-[18px] font-semibold text-text">Securing your slot…</p>
            <p className="text-[12.5px] text-muted">Do not close this page</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
