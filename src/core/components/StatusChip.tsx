import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export type ChipTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const tones: Record<ChipTone, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-secondary/15 text-secondary',
  neutral: 'bg-elevated text-muted',
  primary: 'bg-primary/15 text-primary',
};

export function StatusChip({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function bookingTone(status: string): ChipTone {
  if (status === 'confirmed' || status === 'completed' || status === 'success') return 'success';
  if (status === 'pending' || status === 'refunded') return 'warning';
  if (status === 'cancelled' || status === 'failed') return 'danger';
  return 'neutral';
}
