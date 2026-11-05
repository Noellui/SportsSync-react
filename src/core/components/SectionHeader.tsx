import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function SectionHeader({
  title,
  subtitle,
  action,
  href,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  href?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="font-display text-[22px] font-semibold text-text">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
      </div>
      {href && !action && (
        <Link
          to={href}
          className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-primary min-h-9 min-w-9"
        >
          See all <ChevronRight size={15} aria-hidden />
        </Link>
      )}
      {action}
    </div>
  );
}
