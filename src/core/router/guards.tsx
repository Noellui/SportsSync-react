import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authRepository } from '../../data/repositories/authRepository';
import { useAuthStore } from '../../data/store/authStore';

/**
 * Hydrates the auth store from the session persisted in localStorage on first mount.
 */
export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  useEffect(() => {
    let cancelled = false;
    authRepository.currentUser().then((session) => {
      if (cancelled) return;
      if (session) setAuth(session.user, session.player ?? null);
    });
    return () => { cancelled = true; };
  }, [setAuth]);
  return <>{children}</>;
}

/** Requires login; redirects to /login (replace) if not authenticated. */
export function RequireAuth({ admin = false, player = false, children }: { admin?: boolean; player?: boolean; children?: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (admin && user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  if (player && user.role === 'admin') return <Navigate to="/admin" replace />;
  return children ? <>{children}</> : <Outlet />;
}

/** Logged-in users skip /login and /register. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  }
  return <>{children}</>;
}

/** Small gate that waits for session hydration before routing decisions. */
export function AuthGate() {
  const [ready, setReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  useEffect(() => {
    let cancelled = false;
    authRepository.currentUser().then((session) => {
      if (cancelled) return;
      if (session) setAuth(session.user, session.player ?? null);
      setReady(true);
    }).catch(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [setAuth]);
  if (!ready) return null;
  return <Outlet />;
}
