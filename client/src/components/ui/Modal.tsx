import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = 520,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 28, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ maxWidth: width }}
            className="relative w-full bg-[var(--surface)] border border-[var(--hairline)] rounded-t-2xl sm:rounded-[16px] shadow-[var(--shadow-card)] max-h-[92vh] flex flex-col"
          >
            <header className="flex items-start gap-4 px-5 pt-5 pb-4 border-b border-[var(--hairline)]">
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] leading-tight">{title}</h3>
                {description ? (
                  <p className="text-[13px] text-[var(--ink-3)] mt-1">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Yopish"
                className="shrink-0 h-8 w-8 grid place-items-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X size={16} />
              </button>
            </header>
            <div className="px-5 py-5 overflow-y-auto">{children}</div>
            {footer ? (
              <footer className="px-5 py-4 border-t border-[var(--hairline)] flex justify-end gap-2 bg-[var(--surface-2)] rounded-b-2xl">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
