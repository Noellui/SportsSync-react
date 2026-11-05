import { clsx } from 'clsx';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  showPasswordToggle?: boolean;
  id?: string;
}

export function TextField({
  label,
  icon: Icon,
  error,
  showPasswordToggle,
  className,
  type = 'text',
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  const message = error;
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <div className={clsx('w-full', className)}>
      <label htmlFor={fieldId} className="mb-1.5 block text-[12.5px] font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
        <input
          id={fieldId}
          type={inputType}
          aria-invalid={!!message}
          aria-describedby={message ? `${fieldId}-error` : undefined}
          {...rest}
          className={clsx(
            'h-12 w-full rounded-2xl border bg-elevated px-4 text-[15px] text-text placeholder:text-muted/60',
            'transition-colors focus:outline-none focus:ring-[1.5px] focus:ring-primary',
            Icon && 'pl-11',
            isPassword && showPasswordToggle && 'pr-11',
            message ? 'border-danger/60' : 'border-line',
          )}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-text min-w-9 min-h-9 flex items-center justify-center"
          >
            {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        )}
      </div>
      {message && (
        <p id={`${fieldId}-error`} role="alert" className="mt-1.5 text-[12.5px] text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
