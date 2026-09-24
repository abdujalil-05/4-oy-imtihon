import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Moon, Smartphone, Sun, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../auth/useAuth';
import { roleLabel } from '../../lib/labels';

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { me, signOut } = useAuth();
  const { mode, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!me) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--plane)_86%,transparent)] px-4 py-3 backdrop-blur-xl lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Menyu"
        className="lg:hidden h-9 w-9 grid place-items-center rounded-lg text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <button
        type="button"
        onClick={toggle}
        aria-label={mode === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
        className="relative h-9 w-9 grid place-items-center overflow-hidden rounded-lg text-[var(--ink-2)] hover:bg-[var(--surface-2)] transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode}
            initial={{ y: 14, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -14, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.22 }}
            className="absolute"
          >
            {mode === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-2.5 rounded-[10px] py-1 pl-1 pr-2.5 transition-colors hover:bg-[var(--surface-2)]"
        >
          <Avatar name={me.fullName} src={me.imageUrl} size={30} />
          <span className="hidden text-left sm:block">
            <span className="block text-[13px] font-medium leading-tight">{me.fullName}</span>
            <span className="block text-[11.5px] text-[var(--ink-3)] leading-tight">
              {roleLabel(me.role)}
            </span>
          </span>
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-1 shadow-[var(--shadow-card)]"
            >
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              >
                <User size={15} /> Profil
              </Link>
              <Link
                to="/profile#devices"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              >
                <Smartphone size={15} /> Qurilmalar
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate('/login', { replace: true });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] text-critical hover:bg-critical/10"
              >
                <LogOut size={15} /> Chiqish
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
