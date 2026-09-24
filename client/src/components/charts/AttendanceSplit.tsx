import { motion } from 'framer-motion';
import { Check, Clock, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AttendanceStatus } from '../../lib/types';

export const attendanceMeta: Record<
  AttendanceStatus,
  { label: string; color: string; icon: ReactNode }
> = {
  PRESENT: { label: 'Keldi', color: 'var(--color-good)', icon: <Check size={13} /> },
  LATE: { label: 'Kechikdi', color: 'var(--color-warning)', icon: <Clock size={13} /> },
  ABSENT: { label: 'Kelmadi', color: 'var(--color-critical)', icon: <X size={13} /> },
};

const order: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT'];

export function AttendanceSplit({
  counts,
  caption,
}: {
  counts: Record<AttendanceStatus, number>;
  caption: string;
}) {
  const total = order.reduce((sum, key) => sum + counts[key], 0);

  return (
    <figure className="m-0">
      {total === 0 ? (
        <p className="text-[13px] text-[var(--ink-3)] py-6 text-center">
          Hozircha davomat belgilanmagan
        </p>
      ) : (
        <>
          <div className="flex h-8 gap-[2px] rounded-md overflow-hidden" role="img"
            aria-label={order
              .map((key) => `${attendanceMeta[key].label}: ${counts[key]}`)
              .join(', ')}
          >
            {order.map((key, index) =>
              counts[key] > 0 ? (
                <motion.div
                  key={key}
                  initial={{ flexGrow: 0 }}
                  animate={{ flexGrow: counts[key] }}
                  transition={{ duration: 0.75, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: attendanceMeta[key].color, flexBasis: 0 }}
                  className="first:rounded-l-md last:rounded-r-md"
                />
              ) : null,
            )}
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {order.map((key) => {
              const share = total > 0 ? Math.round((counts[key] / total) * 100) : 0;
              return (
                <li key={key} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className="h-5 w-5 shrink-0 grid place-items-center rounded"
                    style={{ background: attendanceMeta[key].color, color: '#0b0c0e' }}
                  >
                    {attendanceMeta[key].icon}
                  </span>
                  <span className="text-[var(--ink-2)]">{attendanceMeta[key].label}</span>
                  <span className="flex-1 border-b border-dashed border-[var(--hairline)]" />
                  <span className="tnum text-[var(--ink)]">{counts[key]}</span>
                  <span className="tnum text-[var(--ink-3)] w-10 text-right">{share}%</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <figcaption className="mt-3 text-[12px] text-[var(--ink-3)]">{caption}</figcaption>
    </figure>
  );
}
