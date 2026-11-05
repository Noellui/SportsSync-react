import { clsx } from 'clsx';
import { Loader2, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  full?: boolean;
}

export function PrimaryButton({
  loading,
  icon: Icon,
  children,
  variant = 'primary',
  size = 'md',
  full,
  className,
  disabled,
  onClick,
  ...rest
}: PrimaryButtonProps) {
  const v = {
    primary: 'bg-primary-gradient text-on-primary shadow-[0_8px_24px_-8px_rgba(182,255,59,0.5)]',
    outline: 'border border-line bg-transparent text-text',
    ghost: 'bg-elevated/60 text-text',
    danger: 'bg-danger/15 text-danger border border-danger/30',
  }[variant];
  const s = size === 'lg' ? 'h-14 text-base' : 'h-12 text-sm';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={(e) => {
        try { navigator.vibrate?.(10); } catch { /* noop */ }
        onClick?.(e);
      }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold font-body',
        'transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-50 disabled:pointer-events-none min-h-11',
        v, s, full && 'w-full', className,
      )}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden />
      ) : Icon ? (
        <Icon size={18} aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
