import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { navFor } from './nav';
import type { Role } from '../../lib/types';
import { cn } from '../../lib/cn';

export function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const sections = navFor(role);
  const { pathname } = useLocation();

  return (
    <nav className="flex h-full flex-col gap-6 px-3 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <span className="h-9 w-9 grid place-items-center rounded-[10px] bg-[var(--accent-fill)] text-[var(--accent-on-fill)]">
          <GraduationCap size={19} />
        </span>
        <span className="font-display text-[16px] font-semibold tracking-tight">Maktab</span>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.group} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">
              {section.group}
            </p>
            {section.items.map((item) => {
              const active =
                item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] transition-colors',
                    active
                      ? 'text-[var(--ink)] font-medium'
                      : 'text-[var(--ink-2)] hover:text-[var(--ink)]',
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                      className="absolute inset-0 rounded-[10px] bg-[var(--surface-2)] border border-[var(--hairline)]"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 transition-colors',
                      active ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]',
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
