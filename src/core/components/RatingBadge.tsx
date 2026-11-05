import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export function RatingBadge({
  rating,
  reviews,
  size = 'md',
  className,
}: {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const s = size === 'sm' ? 'px-1.5 py-0.5 text-[10.5px] gap-0.5' : 'px-2 py-1 text-[12px] gap-1';
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-bg/70 backdrop-blur-sm font-semibold text-text',
        s, className,
      )}
    >
      <Star size={size === 'sm' ? 10 : 12} className="fill-primary text-primary" aria-hidden />
      {rating.toFixed(1)}
      {reviews !== undefined && <span className="text-muted font-normal">({reviews})</span>}
    </span>
  );
}
