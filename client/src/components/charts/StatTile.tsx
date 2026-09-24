import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Counter } from '../ui/Counter';

interface StatTileProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  unit?: string;
  icon?: ReactNode;
  note?: string;
  meter?: { value: number; max: number; caption: string };
  delay?: number;
}

export function StatTile({
  label,
  value,
  format,
  unit,
  icon,
  note,
  meter,
  delay = 0,
}: StatTileProps) {
  const ratio = meter && meter.max > 0 ? Math.min(meter.value / meter.max, 1) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden bg-[var(--surface)] border border-[var(--hairline)] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.09em] text-[var(--ink-3)]">
          {label}
        </p>
        {icon ? <span className="text-[var(--ink-3)]">{icon}</span> : null}
      </div>

      <p className="mt-3 text-[30px] leading-none font-semibold font-display">
        <Counter value={value} format={format} />
        {unit ? <span className="text-[15px] text-[var(--ink-3)] ml-1.5">{unit}</span> : null}
      </p>

      {note ? <p className="mt-2 text-[12.5px] text-[var(--ink-3)]">{note}</p> : null}

      {ratio != null && meter ? (
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ratio * 100}%` }}
              transition={{ duration: 0.9, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-[var(--chart-fill)]"
            />
          </div>
          <p className="mt-1.5 text-[12px] text-[var(--ink-3)]">{meter.caption}</p>
        </div>
      ) : null}
    </motion.article>
  );
}
