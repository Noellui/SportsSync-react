import { AlertTriangle, RotateCw } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  compact,
}: {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'flex flex-col items-center gap-2 py-6 text-center' : 'flex flex-col items-center justify-center gap-3 py-14 text-center'}>
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-danger/10">
        <AlertTriangle size={24} className="text-danger" aria-hidden />
      </div>
      <p className="max-w-sm text-[13.5px] text-muted">{message}</p>
      {onRetry && (
        <PrimaryButton variant="outline" icon={RotateCw} onClick={onRetry}>
          Retry
        </PrimaryButton>
      )}
    </div>
  );
}
