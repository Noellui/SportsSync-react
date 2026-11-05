import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export function GlassCard({ padded = true, interactive, className, ...rest }: GlassCardProps) {
  return (
    <div
      {...rest}
      className={clsx(
        'rounded-[20px] border border-white/10 bg-surface/70 backdrop-blur-[14px]',
        padded && 'p-4',
        interactive && 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]',
        className,
      )}
    />
  );
}
