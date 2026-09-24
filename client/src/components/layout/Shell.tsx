import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../auth/useAuth';

export function Shell() {
  const { me } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (!me) return null;

  return (
    <div className="grain min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--hairline)] bg-[var(--surface)] lg:block">
        <Sidebar role={me.role} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-[248px] border-r border-[var(--hairline)] bg-[var(--surface)] lg:hidden"
            >
              <Sidebar role={me.role} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex min-w-0 flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex w-full max-w-[1200px] flex-col gap-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
