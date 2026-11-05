import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-elevated">
        <Compass size={28} className="text-primary" aria-hidden />
      </div>
      <h1 className="font-display text-3xl font-bold text-text">404</h1>
      <p className="max-w-xs text-[14px] text-muted">
        This field is off the pitch. The page you are looking for does not exist.
      </p>
      <Link
        to="/login"
        className="rounded-2xl bg-primary-gradient px-6 py-3 text-[14px] font-semibold text-on-primary"
      >
        Back to start
      </Link>
    </div>
  );
}
