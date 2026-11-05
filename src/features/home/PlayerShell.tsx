import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, CalendarCheck, User } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../../core/hooks/useMediaQuery';
import { Logo } from '../../core/components/Logo';

const tabs = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/home/teams', label: 'Teams', icon: Users },
  { to: '/home/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/home/profile', label: 'Profile', icon: User },
];

function TabContent({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={clsx(
        'flex flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors',
        active ? 'text-on-primary' : 'text-muted',
      )}
    >
      {label}
    </span>
  );
}

export function PlayerShell() {
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const showNav = shouldShowPlayerNav(location.pathname);

  if (isDesktop) {
    return (
      <div className="flex min-h-[100dvh]">
        <aside className="sticky top-0 flex h-[100dvh] w-60 flex-col gap-2 border-r border-line bg-surface/60 p-5 backdrop-blur-xl">
          <Logo size={38} withWordmark={false} className="mb-4" />
          <p className="mb-4 font-display text-[15px] font-semibold text-text">SportsSync</p>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors',
                  isActive
                    ? 'bg-primary-gradient text-on-primary'
                    : 'text-muted hover:bg-elevated hover:text-text',
                )
              }
            >
              <t.icon size={18} aria-hidden />
              {t.label}
            </NavLink>
          ))}
        </aside>
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-28">
      <main className="px-5 pt-5">
        <Outlet />
      </main>
      {showNav && <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        aria-label="Primary"
        className="fixed bottom-4 left-4 right-4 z-40 flex h-[68px] items-center justify-around rounded-[28px] border border-white/10 bg-surface/80 px-2 backdrop-blur-[14px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]"
      >
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              clsx(
                'flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 transition-all min-h-11',
                isActive ? 'bg-primary text-on-primary shadow-[0_4px_16px_-4px_rgba(182,255,59,0.6)]' : 'text-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <t.icon size={20} aria-hidden />
                <TabContent label={t.label} active={isActive} />
              </>
            )}
          </NavLink>
        ))}
      </motion.nav>}
    </div>
  );
}

export function shouldShowPlayerNav(pathname: string): boolean {
  return !pathname.startsWith('/home/turf/') && !pathname.startsWith('/home/checkout/');
}
