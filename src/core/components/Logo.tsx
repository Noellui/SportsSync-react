import { clsx } from 'clsx';
import { Target } from 'lucide-react';

export function Logo({ size = 44, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <span
        className="flex items-center justify-center rounded-2xl bg-primary-gradient"
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
        aria-hidden
      >
        <Target style={{ width: size * 0.52, height: size * 0.52 }} className="text-on-primary" />
      </span>
      {withWordmark && (
        <span className="font-display text-[22px] font-bold tracking-[-0.5px] text-text">
          Sports<span className="text-primary">Sync</span>
        </span>
      )}
    </span>
  );
}
