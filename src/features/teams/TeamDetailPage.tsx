import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Crown, CalendarCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useTeam, useRespondToRequest, useSendJoinRequest, useMyBookings } from '../../data/store/hooks';
import { useAuthStore } from '../../data/store/authStore';
import { db } from '../../data/repositories/db';
import { formatDateShort, inr } from '../../core/utils/format';
import { teamShareAmount } from '../../data/repositories/bookingRepository';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { StatusChip } from '../../core/components/StatusChip';
import { BottomSheet } from '../../core/components/BottomSheet';
import { EmptyState } from '../../core/components/EmptyState';

const avatars: Record<string, string> = {
  u_noel: '/images/avatar_1.jpg', u_p1: '/images/avatar_2.jpg',
  u_p2: '/images/avatar_3.jpg', u_p3: '/images/avatar_4.jpg',
  u_p4: '/images/avatar_1.jpg', u_p5: '/images/avatar_2.jpg', u_p6: '/images/avatar_3.jpg',
};
const avatarFor = (userId: string) => avatars[userId] ?? '/images/avatar_4.jpg';
const nameFor = (userId: string) => db.users.find((u) => u.user_id === userId)?.full_name ?? 'Player';
const skillFor = (userId: string) => db.players.find((p) => p.user_id === userId)?.skill_level ?? 'beginner';

const teamStatusTone = { open: 'success', full: 'warning', closed: 'neutral' } as const;

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, player } = useAuthStore();
  const [joinOpen, setJoinOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'members' | 'requests'>('members');

  const { data: team, isLoading, isError, refetch, error } = useTeam(id);
  const { data: bookings = [] } = useMyBookings();
  const sendRequest = useSendJoinRequest();
  const respond = useRespondToRequest();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 w-full rounded-[20px]" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-40 w-full" /></div>;
  if (isError || !team) return <ErrorState message={error?.message ?? 'Team not found'} onRetry={() => refetch()} />;

  const isMember = team.members.some((m) => m.user_id === user?.user_id);
  const teamBookings = bookings.filter((booking) => booking.team_id === team.team_id && (booking.booking_status === 'pending' || booking.booking_status === 'confirmed'));
  const captainName = nameFor(team.captain_user_id);

  const send = async () => {
    if (!player || !user) return;
    try {
      await sendRequest.mutateAsync({ teamId: team.team_id, playerId: player.player_id, userId: user.user_id, message: message.trim() || 'I would like to join!' });
      toast.success('Request sent!');
      setJoinOpen(false);
      setMessage('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send request');
    }
  };

  const respondTo = async (requestId: string, accept: boolean) => {
    try {
      await respond.mutateAsync({ requestId, accept });
      toast.success(accept ? 'Player added to the team!' : 'Request rejected');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="pb-8">
      {/* Header image */}
      <div className="relative h-44">
        <img src={team.sport_image || '/images/sport_football.jpg'} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" aria-hidden />
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-bg/50 backdrop-blur-md"
        >
          <ArrowLeft size={18} className="text-text" aria-hidden />
        </button>
        <div className="absolute inset-x-5 bottom-4">
          <div className="flex items-center gap-2">
            <StatusChip tone={teamStatusTone[team.team_status]}>{team.team_status}</StatusChip>
          </div>
          <h1 className="mt-1.5 font-display text-[26px] font-bold text-text">{team.team_name}</h1>
          <p className="text-[13px] text-muted">{team.sport_name}</p>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-4">
        <p className="text-[14px] leading-relaxed text-muted">{team.description}</p>

        {isMember && teamBookings.length > 0 && <div className="space-y-2">
          <h2 className="font-display text-[17px] font-semibold text-text">Team bookings</h2>
          {teamBookings.map((booking) => <button key={booking.booking_id} type="button" onClick={() => navigate(`/home/bookings?bookingId=${encodeURIComponent(booking.booking_id)}`)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3 text-left">
            <CalendarCheck size={20} className="text-primary" aria-hidden />
            <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-text">{booking.turf_name}</span><span className="block text-[11px] text-muted">{booking.slots[0] ? formatDateShort(booking.slots[0].slot_date) : 'Upcoming'} · {booking.booking_status}</span></span>
            <span className="text-right text-[12px] font-semibold text-primary">{user ? inr(teamShareAmount(booking, user.user_id)) : ''}<span className="block text-[10px] text-muted">{booking.paid_user_ids?.includes(user?.user_id ?? '') ? 'Paid' : 'Tap to pay'}</span></span>
          </button>)}
        </div>}

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3.5">
          <img src={avatarFor(team.captain_user_id)} alt="" className="h-11 w-11 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-text">{captainName}</p>
            <p className="text-[11.5px] text-muted">Captain · joined {formatDateShort(team.created_date)}</p>
          </div>
          <Crown size={16} className="text-primary" aria-hidden />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl bg-surface/70 p-1" role="tablist">
          {(['members', 'requests'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={clsx('flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold capitalize min-h-10',
                tab === t ? 'bg-primary text-on-primary' : 'text-muted')}
            >
              {t} {t === 'requests' && team.pending_requests.length > 0 && `(${team.pending_requests.length})`}
            </button>
          ))}
        </div>

        {tab === 'members' ? (
          <div className="space-y-2.5">
            {team.members.map((m) => (
              <div key={m.team_member_id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface/50 p-3">
                <img src={avatarFor(m.user_id)} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-text">
                    {nameFor(m.user_id)} {m.user_id === user?.user_id && <span className="text-[11px] text-primary">(you)</span>}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {skillFor(m.user_id)} · joined {formatDateShort(m.joined_at)}
                  </p>
                </div>
                <StatusChip tone={m.member_role === 'captain' ? 'primary' : 'neutral'}>
                  {m.member_role}
                </StatusChip>
              </div>
            ))}
          </div>
        ) : (
          team.pending_requests.length === 0 ? (
            <EmptyState icon={UserPlus} title="No pending requests" message="Join requests will appear here." />
          ) : (
            <div className="space-y-2.5">
              {team.pending_requests.map((r) => (
                <div key={r.request_id} className="rounded-2xl border border-line bg-surface/50 p-3.5">
                  <div className="flex items-center gap-3">
                    <img src={avatarFor(db.players.find((p) => p.player_id === r.player_id)?.user_id ?? '')} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-text">
                        {db.users.find((u) => u.user_id === db.players.find((p) => p.player_id === r.player_id)?.user_id)?.full_name ?? 'Player'}
                      </p>
                      <p className="text-[11.5px] text-muted capitalize">{skillFor(db.players.find((p) => p.player_id === r.player_id)?.user_id ?? '')}</p>
                    </div>
                  </div>
                  <p className="mt-2.5 rounded-xl bg-elevated/50 px-3.5 py-2.5 text-[13px] italic text-muted">“{r.message}”</p>
                  <div className="mt-3 flex gap-2">
                    <PrimaryButton variant="ghost" className="flex-1" onClick={() => respondTo(r.request_id, false)}>
                      Reject
                    </PrimaryButton>
                    <PrimaryButton
                      className="flex-1"
                      loading={respond.isPending && respond.variables?.requestId === r.request_id}
                      onClick={() => respondTo(r.request_id, true)}
                    >
                      Accept
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Actions */}
        {!isMember && team.team_status === 'open' && (
          <PrimaryButton size="lg" full icon={UserPlus} onClick={() => setJoinOpen(true)}>
            Join this team
          </PrimaryButton>
        )}
        {user?.user_id === team.captain_user_id && <PrimaryButton
          variant="outline"
          size="lg"
          full
          onClick={() => navigate(`/home/turfs?teamId=${encodeURIComponent(team.team_id)}`)}
        >
          Book a turf for {team.member_count} team members
        </PrimaryButton>}
      </div>

      <BottomSheet open={joinOpen} onClose={() => setJoinOpen(false)} title={`Join ${team.team_name}`}>
        <div className="space-y-4 pb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Tell the captain why you'd be a good fit…"
            aria-label="Join request message"
            className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[13.5px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
          />
          <PrimaryButton size="lg" full loading={sendRequest.isPending} onClick={send}>
            Send request
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
