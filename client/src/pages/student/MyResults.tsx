import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatTile } from '../../components/charts/StatTile';
import { keys, useList } from '../../lib/queries';
import { date } from '../../lib/format';
import type { ExamResult } from '../../lib/types';

export function MyResults() {
  const { data, isLoading } = useList<ExamResult[]>(keys.myResults, '/exam-result/my');
  const rows = useMemo(() => data ?? [], [data]);

  const best = rows.reduce((max, row) => Math.max(max, row.score), 0);
  const average =
    rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;

  return (
    <>
      <PageHeader title="Natijalarim" subtitle="Imtihonlardagi ballaringiz" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Imtihonlar" value={rows.length} unit="ta" />
        <StatTile label="O'rtacha ball" value={average} delay={0.06} />
        <StatTile label="Eng yuqori ball" value={best} delay={0.12} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Imtihon natijalari" subtitle="Eng so'nggisidan boshlab" />
        {isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} h={18} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Trophy size={20} />}
            title="Natijalar yo'q"
            message="Imtihon topshirganingizdan so'ng natijalar shu yerda chiqadi."
          />
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {rows.map((row, index) => {
              const max = row.exam?.maxScore ?? 100;
              const share = max > 0 ? Math.min((row.score / max) * 100, 100) : 0;
              return (
                <motion.li
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, delay: Math.min(index * 0.05, 0.3) }}
                  className="px-5 py-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium">{row.exam?.title ?? 'Imtihon'}</p>
                    <p className="shrink-0 font-display text-[18px] font-semibold tnum">
                      {row.score}
                      <span className="ml-0.5 text-[12px] font-normal text-[var(--ink-3)]">/{max}</span>
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ duration: 0.85, delay: 0.12 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[var(--chart-fill)]"
                    />
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-[var(--ink-3)]">
                    {row.comment ? `${row.comment} · ` : ''}
                    {date(row.createdAt)}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
