import { useLocation, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTurfs, useSports } from '../../data/store/hooks';
import { TurfCard } from '../home/TurfCard';
import { SectionHeader } from '../../core/components/SectionHeader';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { EmptyState } from '../../core/components/EmptyState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { clsx } from 'clsx';
import { db } from '../../data/repositories/db';

export function TurfListPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as { sportId?: string; sportName?: string };
  const teamId = new URLSearchParams(location.search).get('teamId');
  const teamSportId = db.teams.find((team) => team.team_id === teamId)?.sport_id;
  const [sportId, setSportId] = useState<string | null>(teamSportId ?? state.sportId ?? null);
  const [query, setQuery] = useState('');

  const { data: sports = [] } = useSports();
  const { data: turfs, isLoading, isError, refetch, error } = useTurfs({
    sportId: sportId ?? undefined,
    query: query || undefined,
  });

  const activeSport = sports.find((s) => s.sport_id === sportId);

  return (
    <div className="space-y-6 pb-6">
      <header>
        <SectionHeader title={activeSport ? `${activeSport.sport_name} turfs` : 'Browse turfs'} subtitle={turfs ? `${turfs.length} venues in Ahmedabad` : undefined} />
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or area"
            aria-label="Search turfs"
            className="h-12 w-full rounded-2xl border border-line bg-elevated pl-11 pr-4 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
          />
        </div>
      </header>

      {!teamSportId && <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSportId(null)}
          className={clsx(
            'shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
            !sportId ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
          )}
        >
          All
        </button>
        {sports.map((s) => (
          <button
            key={s.sport_id}
            onClick={() => setSportId(s.sport_id)}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
              sportId === s.sport_id ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
            )}
          >
            {s.sport_name}
          </button>
        ))}
      </div>}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-[20px]" />)}
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : !turfs || turfs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No turfs found"
          message="Try another sport or search term."
          action={<Link to="/home/turfs"><PrimaryButton variant="outline">View all turfs</PrimaryButton></Link>}
        />
      ) : (
        <div className="space-y-3">
          {turfs.map((t) => <TurfCard key={t.turf_id} turf={t} horizontal />)}
        </div>
      )}
    </div>
  );
}
