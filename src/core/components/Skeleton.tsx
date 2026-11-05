import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-shimmer rounded-xl bg-gradient-to-r from-elevated via-line/60 to-elevated bg-[length:1000px_100%]',
        className,
      )}
    />
  );
}
