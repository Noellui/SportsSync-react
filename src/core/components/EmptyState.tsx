import { type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-elevated">
        <Icon size={28} className="text-muted" aria-hidden />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-text">{title}</p>
        {message && <p className="mt-1 max-w-xs text-[13.5px] text-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
