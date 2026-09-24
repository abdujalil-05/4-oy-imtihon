import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Card({
  children,
  className,
  delay = 0,
  id,
}: {
  children?: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'bg-[var(--surface)] border border-[var(--hairline)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--hairline)]">
      <div className="min-w-0">
        <h2 className="text-[15px] leading-tight">{title}</h2>
        {subtitle ? <p className="text-[12.5px] text-[var(--ink-3)] mt-0.5">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
