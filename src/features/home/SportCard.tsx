import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { Sport } from '../../data/models/sport';

const sportImages: Record<string, string> = {
  Football: '/images/sport_football.jpg',
  Cricket: '/images/sport_cricket.jpg',
  Basketball: '/images/sport_basketball.jpg',
  Badminton: '/images/sport_badminton.jpg',
  Tennis: '/images/sport_tennis.jpg',
  Pickleball: '/images/sport_pickleball.jpg',
};

export function SportCard({ sport, selected, onClick }: { sport: Sport; selected?: boolean; onClick?: () => void }) {
  return (
    <Link
      to="/home/turfs"
      state={{ sportId: sport.sport_id, sportName: sport.sport_name }}
      onClick={onClick}
      aria-label={`Browse turfs for ${sport.sport_name}`}
      className="block shrink-0"
    >
      <motion.div
        whileTap={{ scale: 0.96 }}
        className={clsx(
          'relative h-[112px] w-24 overflow-hidden rounded-[20px] border-2',
          selected ? 'border-primary shadow-[0_0_20px_-4px_rgba(182,255,59,0.5)]' : 'border-transparent',
        )}
      >
        <img
          src={sportImages[sport.sport_name] ?? '/images/sport_football.jpg'}
          alt=""
          className="h-full w-full object-cover brightness-60"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/95 to-transparent p-2 pt-6">
          <p className="text-[12px] font-semibold leading-tight text-text">{sport.sport_name}</p>
        </div>
      </motion.div>
    </Link>
  );
}
