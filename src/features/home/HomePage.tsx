import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Bell, MapPin, Navigation,
  CalendarCheck, Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../data/store/authStore';
import { useTurfs, useSports, useMyBookings } from '../../data/store/hooks';
import { SportCard } from './SportCard';
import { TurfCard } from './TurfCard';
import { SectionHeader } from '../../core/components/SectionHeader';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { EmptyState } from '../../core/components/EmptyState';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { BottomSheet } from '../../core/components/BottomSheet';
import { countdownLabel, inr } from '../../core/utils/format';
import { avatarForUser } from '../../core/utils/avatar';

const promoSlides = [
  { id: 1, title: '20% off your first booking', sub: 'Code: FIRSTPLAY20', img: '/images/turf_1.jpg' },
  { id: 2, title: 'Weekend league night', sub: 'Every Saturday, 8 PM', img: '/images/turf_6.jpg' },
  { id: 3, title: 'Split the fee, keep the fun', sub: 'Book with your squad', img: '/images/turf_3.jpg' },
];

export function HomePage() {
  const { user, player } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as { sportId?: string };

  const [selectedSport, setSelectedSport] = useState<string | null>(state.sportId ?? null);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromoIndex((i) => (i + 1) % promoSlides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const { data: sports = [] } = useSports();
  const { data: turfs, isLoading, isError, refetch, error } = useTurfs({
    sportId: selectedSport ?? undefined,
    query: search || undefined,
    maxPrice: maxPrice < 2000 ? maxPrice : undefined,
    minRating: minRating || undefined,
  });
  const { data: bookings = [] } = useMyBookings();

  const upcoming = useMemo(
    () => bookings.find((b) => b.booking_status === 'confirmed' && b.slots[0]?.slot_date),
    [bookings],
  );

  const featured = turfs?.slice(0, 4) ?? [];
  const allTurfs = turfs ?? [];

  const firstName = user?.full_name.split(' ')[0] ?? 'Player';

  return (
    <div className="space-y-7 pb-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2 ring-offset-bg">
            <img src={avatarForUser(user?.user_id, user?.profile_image)} alt={user?.full_name ?? ''} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-display text-[18px] font-semibold text-text">Hey, {firstName} 👋</h3>
            <p className="flex items-center gap-1 text-[12px] text-muted">
              <MapPin size={11} aria-hidden />
              {player?.city ?? 'Ahmedabad'}
            </p>
          </div>
        </div>
        <button
          onClick={() => toast('3 new notifications (demo)')}
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface/70 backdrop-blur-md"
        >
          <Bell size={18} className="text-text" aria-hidden />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" aria-hidden />
        </button>
      </header>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search turfs, sports, areas"
            aria-label="Search turfs"
            className="h-14 w-full rounded-2xl border border-line bg-elevated pl-11 pr-4 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Open filters"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-gradient"
        >
          <SlidersHorizontal size={19} className="text-on-primary" aria-hidden />
        </button>
      </div>

      {/* Sports row */}
      <section aria-label="Sports">
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
          {sports.map((s) => (
            <SportCard
              key={s.sport_id}
              sport={s}
              selected={selectedSport === s.sport_id}
              onClick={() => setSelectedSport(selectedSport === s.sport_id ? null : s.sport_id)}
            />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section aria-label="Promotions" className="relative h-40 overflow-hidden rounded-[20px]">
        {promoSlides.map((p, i) => (
          <motion.div
            key={p.id}
            initial={false}
            animate={{ opacity: i === promoIndex ? 1 : 0, x: i === promoIndex ? 0 : i < promoIndex ? -24 : 24 }}
            transition={{ duration: 0.45 }}
            className={clsx('absolute inset-0', i !== promoIndex && 'pointer-events-none')}
            aria-hidden={i !== promoIndex}
          >
            <img src={p.img} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Sparkles size={12} aria-hidden /> Deal
              </p>
              <p className="font-display text-[19px] font-bold leading-snug text-text">{p.title}</p>
              <p className="text-[12.5px] text-muted">{p.sub}</p>
              <button
                onClick={() => navigate('/home/turfs')}
                className="mt-1.5 w-fit rounded-xl bg-primary-gradient px-4 py-2 text-[12.5px] font-bold text-on-primary min-h-9"
              >
                Book now
              </button>
            </div>
          </motion.div>
        ))}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {promoSlides.map((p, i) => (
            <button
              key={p.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setPromoIndex(i)}
              className={clsx('h-1.5 rounded-full transition-all', i === promoIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/30')}
            />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section aria-label="Featured turfs">
        <SectionHeader title="Featured near you" href="/home/turfs" />
        {isLoading ? (
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[260px] shrink-0 space-y-2">
                <Skeleton className="h-[187px] w-full rounded-[20px]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        ) : featured.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No turfs found"
            message="Try a different sport or clear your filters."
            action={<PrimaryButton variant="outline" onClick={() => { setSelectedSport(null); setSearch(''); }}>Clear filters</PrimaryButton>}
          />
        ) : (
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-5">
            {featured.map((t) => (
              <TurfCard key={t.turf_id} turf={t} layoutId={`turf-img-${t.turf_id}`} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming booking */}
      {upcoming && upcoming.slots[0] && (
        <section aria-label="Upcoming booking">
          <SectionHeader title="Up next" />
          <div className="rounded-[20px] border border-line bg-surface/70 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {upcoming.turf_image && (
                <img src={upcoming.turf_image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[15.5px] font-semibold text-text">{upcoming.turf_name}</p>
                <p className="text-[12.5px] text-muted">
                  {countdownLabel(upcoming.slots[0].slot_date, upcoming.slots[0].start_time)}
                </p>
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10.5px] font-bold uppercase text-success">
                Confirmed
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <PrimaryButton
                variant="ghost"
                icon={Navigation}
                className="flex-1"
                onClick={() => toast('Opening directions (demo)')}
              >
                Directions
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                icon={CalendarCheck}
                className="flex-1"
                onClick={() => navigate('/home/bookings')}
              >
                Details
              </PrimaryButton>
            </div>
          </div>
        </section>
      )}

      {/* All turfs */}
      <section aria-label="All turfs">
        <SectionHeader title="All turfs" href="/home/turfs" />
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-[20px]" />)}
          </div>
        ) : allTurfs.length === 0 ? (
          <EmptyState icon={Search} title="Nothing here yet" message="No turfs match your search." />
        ) : (
          <div className="space-y-3">
            {allTurfs.map((t) => <TurfCard key={t.turf_id} turf={t} horizontal />)}
          </div>
        )}
      </section>

      {/* Filter sheet */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <div className="space-y-6 pb-4">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-text">
              Max price: <span className="text-primary">{maxPrice >= 2000 ? 'Any' : inr(maxPrice)}</span>
            </p>
            <input
              type="range"
              min={500}
              max={2000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Maximum price"
            />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-text">Minimum rating</p>
            <div className="flex gap-2">
              {[0, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-[12.5px] font-semibold min-h-9',
                    minRating === r ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
                  )}
                >
                  {r === 0 ? 'Any' : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-text">Sport</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((s) => (
                <button
                  key={s.sport_id}
                  onClick={() => setSelectedSport(selectedSport === s.sport_id ? null : s.sport_id)}
                  className={clsx(
                    'rounded-full border px-3.5 py-2 text-[12.5px] font-semibold min-h-9',
                    selectedSport === s.sport_id ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted',
                  )}
                >
                  {s.sport_name}
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton
            size="lg"
            full
            onClick={() => { setFilterOpen(false); toast('Filters applied'); }}
          >
            Apply
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
