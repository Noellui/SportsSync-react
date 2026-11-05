import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { useTeams, useSports, useSendJoinRequest } from '../../data/store/hooks';
import { useAuthStore } from '../../data/store/authStore';
import { SectionHeader } from '../../core/components/SectionHeader';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { EmptyState } from '../../core/components/EmptyState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { StatusChip } from '../../core/components/StatusChip';
import { BottomSheet } from '../../core/components/BottomSheet';
import { toast } from 'sonner';
import type { TeamWithExtras } from '../../data/repositories/teamRepository';
import { db } from '../../data/repositories/db';
import { avatarForUser } from '../../core/utils/avatar';

const teamStatusTone = { open: 'success', full: 'warning', closed: 'neutral' } as const;

export function TeamCard({ team, onJoin }: { team: TeamWithExtras; onJoin: () => void }) {
  const shown = team.members.slice(0, 4);
  const captain = db.users.find((user) => user.user_id === team.captain_user_id);
  const captainPlayer = db.players.find((player) => player.user_id === team.captain_user_id);
  const pct = Math.min(100, Math.round((team.member_count / team.required_players) * 100));

  return (
    <div className="rounded-[20px] border border-line bg-surface/70 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
          <Trophy size={20} className="text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[16px] font-semibold text-text">{team.team_name}</p>
          <p className="text-[12px] text-muted">{team.sport_name}</p>
        </div>
        <StatusChip tone={teamStatusTone[team.team_status]}>{team.team_status}</StatusChip>
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-elevated/55 p-2.5">
        <img src={avatarForUser(team.captain_user_id, captain?.profile_image)} alt={`${captain?.full_name ?? 'Player'}, team captain`} className="h-9 w-9 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold text-text">{captain?.full_name ?? 'Player'}</p>
          <p className="text-[11px] text-muted">Captain · {captainPlayer?.skill_level ?? 'Player'}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2.5">
          {shown.map((m) => (
            <img
              key={m.team_member_id}
              src={avatarForUser(m.user_id, db.users.find((user) => user.user_id === m.user_id)?.profile_image)}
              alt=""
              className="h-8 w-8 rounded-full border-2 border-surface object-cover"
            />
          ))}
        </div>
        {team.member_count > 4 && (
          <span className="text-[11.5px] font-semibold text-muted">+{team.member_count - 4}</span>
        )}
        <span className="ml-auto text-[12.5px] font-semibold text-text">
          {team.member_count} / {team.required_players}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div className="h-full rounded-full bg-primary-gradient" style={{ width: `${pct}%` }} />
      </div>

      {team.team_status === 'open' && (
        <PrimaryButton
          variant="ghost"
          icon={Users}
          full
          className="mt-3.5"
          onClick={onJoin}
        >
          Request to join
        </PrimaryButton>
      )}
    </div>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();
  const [sportId, setSportId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [joinTeam, setJoinTeam] = useState<TeamWithExtras | null>(null);
  const [message, setMessage] = useState('');

  const { data: sports = [] } = useSports();
  const { data: teams, isLoading, isError, refetch, error } = useTeams(sportId ?? undefined);
  const sendRequest = useSendJoinRequest();
  const { user, player } = useAuthStore();

  const filtered = teams?.filter((t) => !query || t.team_name.toLowerCase().includes(query.toLowerCase())) ?? [];

  const send = async () => {
    if (!joinTeam || !player || !user) return;
    try {
      await sendRequest.mutateAsync({
        teamId: joinTeam.team_id,
        playerId: player.player_id,
        userId: user.user_id,
        message: message.trim() || 'I would like to join your team!',
      });
      toast.success('Request sent! The captain will respond soon.');
      setJoinTeam(null);
      setMessage('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send request');
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <SectionHeader title="Teams" subtitle="Find your squad" />

      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams"
          aria-label="Search teams"
          className="h-12 w-full rounded-2xl border border-line bg-elevated pl-11 pr-4 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
        />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
        <button
          onClick={() => setSportId(null)}
          className={clsx('shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
            !sportId ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted')}
        >
          All
        </button>
        {sports.map((s) => (
          <button
            key={s.sport_id}
            onClick={() => setSportId(s.sport_id)}
            className={clsx('shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
              sportId === s.sport_id ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted')}
          >
            {s.sport_name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-[20px]" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams found"
          message="Be the first — create your own team."
          action={<PrimaryButton icon={Plus} onClick={() => navigate('/home/teams/create')}>Create team</PrimaryButton>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => <TeamCard key={t.team_id} team={t} onJoin={() => setJoinTeam(t)} />)}
        </div>
      )}

      <button
        onClick={() => navigate('/home/teams/create')}
        className="fixed bottom-28 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-primary-gradient px-5 font-semibold text-on-primary shadow-[0_12px_32px_-8px_rgba(182,255,59,0.5)] min-h-11"
        aria-label="Create team"
      >
        <Plus size={20} aria-hidden /> Create team
      </button>

      <BottomSheet open={!!joinTeam} onClose={() => setJoinTeam(null)} title={`Join ${joinTeam?.team_name ?? ''}?`}>
        <div className="space-y-4 pb-4">
          <p className="text-[13.5px] text-muted">Send a short message to the captain:</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Hi! I play striker and would love to join…"
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
