import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck, User, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../../core/hooks/useMediaQuery';
import { Logo } from '../../core/components/Logo';

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/turfs', label: 'Venue', icon: Building2 },
  { to: '/admin/slots', label: 'Slots', icon: CalendarCheck },
  { to: '/admin/bookings', label: 'Bookings', icon: User },
  { to: '/admin/profile', label: 'Profile', icon: User },
];

export function AdminShell() {
  const isDesktop = useIsDesktop();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isDesktop) {
    return (
      <div className="flex min-h-[100dvh]">
        <aside className="sticky top-0 flex h-[100dvh] w-64 flex-col gap-2 border-r border-line bg-surface/60 p-5 backdrop-blur-xl">
          <div className="mb-6">
            <Logo size={38} withWordmark={false} className="mx-auto" />
            <p className="mt-2 text-center font-display text-[15px] font-semibold text-text">Admin Panel</p>
          </div>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors',
                  isActive ? 'bg-primary-gradient text-on-primary' : 'text-muted hover:bg-elevated hover:text-text',
                )
              }
            >
              <t.icon size={18} aria-hidden />
              {t.label}
            </NavLink>
          ))}
        </aside>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/90 px-5 backdrop-blur-xl">
        <button onClick={() => setMobileOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70">
          <Menu size={20} className="text-text" aria-hidden />
        </button>
        <Logo size={38} withWordmark={false} />
        <span className="w-11" />
      </header>
      <main className="px-5 py-4 pb-24">
        <Outlet />
      </main>

      <nav aria-label="Admin navigation" className="fixed bottom-4 left-4 right-4 z-30 grid grid-cols-5 rounded-[28px] border border-white/10 bg-surface/90 p-2 backdrop-blur-xl">
        {tabs.map((t) => <NavLink key={t.to} to={t.to} className={({ isActive }) => clsx('flex min-h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold', isActive ? 'bg-primary text-on-primary' : 'text-muted')}>
          <t.icon size={18} aria-hidden />{t.label}
        </NavLink>)}
      </nav>

      <motion.div
        initial={false}
        animate={{ opacity: mobileOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm lg:hidden"
      >
        <motion.aside
          initial={{ x: 280 }}
          animate={{ x: mobileOpen ? 0 : 280 }}
          exit={{ x: 280 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute top-16 right-0 bottom-0 w-64 border-l border-line bg-surface p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-[15px] font-semibold text-text">Admin Menu</p>
            <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface">
              <X size={16} aria-hidden />
            </button>
          </div>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx('flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold',
                  isActive ? 'bg-primary-gradient text-on-primary' : 'text-muted hover:bg-elevated hover:text-text')}
            >
              <t.icon size={18} aria-hidden />
              {t.label}
            </NavLink>
          ))}
        </motion.aside>
      </motion.div>
    </div>
  );
}

