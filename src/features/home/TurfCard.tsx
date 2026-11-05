import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { inr } from '../../core/utils/format';
import type { TurfWithExtras } from '../../data/repositories/turfRepository';

export function TurfCard({
  turf,
  horizontal,
  layoutId,
}: {
  turf: TurfWithExtras;
  horizontal?: boolean;
  layoutId?: string;
}) {
  const location = useLocation();
  const players = new URLSearchParams(location.search).get('players');
  const destination = `/home/turf/${turf.turf_id}${players ? `?players=${encodeURIComponent(players)}` : ''}`;
  const img = turf.images.find((i) => i.is_primary)?.image_url ?? turf.images[0]?.image_url ?? '';
  const area = turf.address.split(',')[0];

  if (horizontal) {
    return (
      <Link to={destination} className="block" aria-label={`View ${turf.turf_name}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex gap-3 rounded-[20px] border border-line bg-surface/70 p-3 backdrop-blur-sm"
        >
          <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-2xl">
            <img src={img} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-[16px] font-semibold text-text">{turf.turf_name}</h3>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                <MapPin size={12} aria-hidden /> {area}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[12.5px] font-semibold text-text">
                <Star size={12} className="fill-primary text-primary" aria-hidden />
                {turf.rating.toFixed(1)}
              </span>
              <span className="text-[13px] font-bold text-primary">{inr(turf.min_price)} / hr</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={destination} className="block shrink-0" aria-label={`View ${turf.turf_name}`}>
      <motion.div
        layoutId={layoutId}
        whileTap={{ scale: 0.98 }}
        className={clsx('w-[260px] overflow-hidden rounded-[20px] border border-line bg-surface/70 backdrop-blur-sm')}
      >
        <div className="relative h-[187px]">
          <img src={img} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="Add to favorites"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-bg/60 backdrop-blur-sm"
          >
            <Heart size={16} className="text-text" aria-hidden />
          </button>
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-bg/70 px-2 py-1 text-[11.5px] font-semibold text-text backdrop-blur-sm">
            <Star size={11} className="fill-primary text-primary" aria-hidden />
            {turf.rating.toFixed(1)}
          </span>
        </div>
        <div className="p-3.5">
          <h3 className="truncate font-display text-[16px] font-semibold text-text">{turf.turf_name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
            <MapPin size={12} aria-hidden /> {area}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1">
              {turf.sport_ids.slice(0, 3).map((sid) => (
                <span key={sid} className="rounded-md bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  {sid.replace('s_', '').slice(0, 4)}
                </span>
              ))}
            </div>
            <span className="text-[13.5px] font-bold text-primary">{inr(turf.min_price)} / hr</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
