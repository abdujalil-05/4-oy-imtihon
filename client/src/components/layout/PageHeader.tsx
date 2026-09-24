import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0">
        {back ? (
          <Link
            to={back.to}
            className="mb-2 inline-flex items-center gap-1 text-[12.5px] text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          >
            <ChevronLeft size={14} />
            {back.label}
          </Link>
        ) : null}
        <h1 className="text-[24px] leading-tight sm:text-[27px]">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </motion.div>
  );
}
