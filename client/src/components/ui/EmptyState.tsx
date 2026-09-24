import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6"
    >
      <span className="h-12 w-12 grid place-items-center rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink-3)]">
        {icon}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-[13px] text-[var(--ink-3)] mt-0.5 max-w-sm">{message}</p>
      </div>
      {action}
    </motion.div>
  );
}
